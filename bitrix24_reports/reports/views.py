import json
import pandas as pd
import matplotlib.pyplot as plt
import io
import base64
from datetime import datetime
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework import status
from bitrix24 import Bitrix24
from .models import Report
from .serializers import ReportSerializer
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)

WEBHOOK_URL = 'https://b24-e5lu18.bitrix24.ru/rest/1/5nrecrcpia0kypj5/'
bx24 = Bitrix24(WEBHOOK_URL)

def get_entity_fields(entity_type_id):
    response = bx24.callMethod('crm.item.fields', entityTypeId=entity_type_id)
    return response

def get_smart_process_data(entity_type_id, start_date, end_date, selected_fields):
    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')
    
    params = {
        'entityTypeId': entity_type_id,
        'filter[>DATE_CREATE]': start_date_str,
        'filter[<DATE_CREATE]': end_date_str
    }
    response = bx24.callMethod('crm.item.list', **params)
    items = response.get('result', {}).get('items', [])

    data = []
    for item in items:
        row = {'Дата': item['DATE_CREATE']}
        for field in selected_fields:
            row[field] = item.get(field, None)
        data.append(row)
    
    df = pd.DataFrame(data)
    df['Дата'] = pd.to_datetime(df['Дата'])
    return df

def generate_plot(df, selected_fields):
    plt.figure(figsize=(10, 5))
    for field in selected_fields:
        if field in df.columns:
            plt.plot(df['Дата'], df[field], label=field)
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_png = buffer.getvalue()
    buffer.close()

    graphic = base64.b64encode(image_png).decode('utf-8')
    return graphic

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def perform_create(self, serializer):
        report = serializer.save()
        self._update_report_data(report)

    def perform_update(self, serializer):
        report = serializer.save()
        self._update_report_data(report)

    def _update_report_data(self, report):
        entity_type_id = report.entity_type_id
        selected_fields = report.fields

        # Получение метаданных полей
        fields = get_entity_fields(entity_type_id)
        multiple_fields_info = get_multiple_fields_info(fields)

        try:
            response = bx24.callMethod('crm.item.list', entityTypeId=entity_type_id)
            items = response.get("items", [])
            data = []

            for item in items:
                row = {}
                if 'createdTime' in item:
                    row['Дата'] = item['createdTime']
                    for field in selected_fields:
                        if field in multiple_fields_info:
                            # Обработка множественных полей
                            field_values = item.get(field, [])
                            row[fields['fields'][field]['title']] = [multiple_fields_info[field].get(value, value) for value in field_values]
                        else:
                            row[fields['fields'][field]['title']] = item.get(field, None)
                    data.append(row)
                else:
                    logger.warning(f"Item missing createdTime field: {item}")

            # Создание DataFrame
            df = pd.DataFrame(data)
            if not df.empty:
                df['Дата'] = pd.to_datetime(df['Дата'])

            # Формирование результатов
            result = {
                "headers": ['Дата'] + [fields['fields'][field]['title'] for field in selected_fields if field in fields['fields']],
                "rows": df.to_dict(orient='records')
            }

            # Преобразование дат в строки для JSON-сериализации и обработка NaN значений
            for row in result["rows"]:
                row["Дата"] = row["Дата"].isoformat()
                for key in row:
                    if isinstance(row[key], float) and pd.isna(row[key]):
                        row[key] = None

            # Сохранение данных отчета в формате JSON в базе данных
            report.report_data = json.dumps(result, ensure_ascii=False, indent=4)
            report.save()

        except Exception as e:
            logger.error(f"Error updating report data: {str(e)}")

    @action(detail=True, methods=['get'])
    def export_excel(self, request, pk=None):
        report = self.get_object()
        df = get_smart_process_data(report.entity_type_id, report.start_date, report.end_date, report.fields)
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename={report.name}.xlsx'
        df.to_excel(response, index=False)
        return response

    @action(detail=True, methods=['get'])
    def export_image(self, request, pk=None):
        report = self.get_object()
        df = get_smart_process_data(report.entity_type_id, report.start_date, report.end_date, report.fields)
        plot = generate_plot(df, report.fields)
        return HttpResponse(base64.b64decode(plot), content_type='image/png')

    @action(detail=False, methods=['get'])
    def fields(self, request, entity_type_id):
        fields = get_entity_fields(entity_type_id)
        return Response(fields)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user = self.get_object()
        refresh = RefreshToken.for_user(user)
        response.data['refresh'] = str(refresh)
        response.data['access'] = str(refresh.access_token)
        return response

@api_view(['GET'])
def get_fields(request, entity_type_id):
    try:
        logger.debug("Starting request to Bitrix24 for fields")
        response = bx24.callMethod('crm.item.fields', entityTypeId=entity_type_id)
        logger.debug(f"Response from Bitrix24: {response}")
        fields = response
        if not fields:
            logger.warning("No fields found in the response from Bitrix24")
        return Response(fields, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching fields: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_multiple_fields_info(fields):
    multiple_fields_info = {}
    for field_id, field_info in fields.get("fields").items():
        if field_info.get('isMultiple', False):
            if 'items' in field_info:
                multiple_fields_info[field_id] = {item['ID']: item['VALUE'] for item in field_info['items']}
    return multiple_fields_info

@api_view(['GET'])
def get_report_data(request, pk):
    report = get_object_or_404(Report, pk=pk)
    if report.report_data:
        saved_data = json.loads(report.report_data)  # Deserialize the JSON data
        return Response(saved_data, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Report data not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_entity_types(request):
    try:
        # Получение смарт-процессов
        response = bx24.callMethod('crm.type.list')
        smart_processes = response.get('types', [])

        # Стандартные сущности CRM
        standard_entities = [
            {"entityTypeId": "1", "title": "Контакты"},
            {"entityTypeId": "2", "title": "Сделки"},
            {"entityTypeId": "3", "title": "Компания"}
        ]

        # Объединение стандартных сущностей и смарт-процессов
        entity_types = standard_entities + smart_processes

        return Response(entity_types, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching entity types: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

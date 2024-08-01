from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, get_fields, get_entity_types, get_report_data

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView

router = DefaultRouter()
router.register(r'reports', ReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('fields/<int:entity_type_id>/', get_fields),
    path('reports/<int:pk>/data/', get_report_data),
    path('entity_types/', get_entity_types),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

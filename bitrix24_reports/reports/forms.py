# reports/forms.py
from django import forms

class ReportForm(forms.Form):
    start_date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))
    end_date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))
    fields = forms.MultipleChoiceField(
        widget=forms.CheckboxSelectMultiple,
        choices=[],  # Будем заполнять этот список динамически в представлении
    )

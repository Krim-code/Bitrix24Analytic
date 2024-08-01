from django.db import models

class Report(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    fields = models.JSONField()
    entity_type_id = models.IntegerField()  # Добавляем новое поле
    report_data = models.JSONField(null=True, blank=True) 
    def __str__(self):
        return self.title
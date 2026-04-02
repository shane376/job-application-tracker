from django.conf import settings
from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "applied", "Applied"
        INTERVIEW = "interview", "Interview"
        REJECTED = "rejected", "Rejected"
        OFFER = "offer", "Offer"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    job_description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.company} - {self.role}"

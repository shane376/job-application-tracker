from django.conf import settings
from django.db import models


class MatchResult(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="match_results",
    )
    application = models.ForeignKey(
        "applications.Application",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="match_results",
    )
    resume = models.ForeignKey(
        "resumes.Resume",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="match_results",
    )
    job_description_text = models.TextField()
    match_score = models.PositiveSmallIntegerField(default=0)
    missing_skills = models.JSONField(default=list)
    improvement_suggestions = models.JSONField(default=list)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"match:{self.user_id}:{self.match_score}"

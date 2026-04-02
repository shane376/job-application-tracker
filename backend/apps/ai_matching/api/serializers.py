from rest_framework import serializers

from apps.ai_matching.models import MatchResult


class MatchRequestSerializer(serializers.Serializer):
    application_id = serializers.IntegerField(required=False)
    resume_id = serializers.IntegerField(required=True)
    job_description = serializers.CharField(required=False, allow_blank=False)


class MatchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchResult
        fields = (
            "id",
            "application",
            "resume",
            "job_description_text",
            "match_score",
            "missing_skills",
            "improvement_suggestions",
            "created_at",
        )
        read_only_fields = fields

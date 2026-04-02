from rest_framework import serializers

from apps.resumes.models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = (
            "id",
            "title",
            "file",
            "extracted_text",
            "uploaded_at",
            "updated_at",
        )
        read_only_fields = ("id", "extracted_text", "uploaded_at", "updated_at")


class ResumeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ("id", "title", "uploaded_at", "updated_at")
        read_only_fields = fields

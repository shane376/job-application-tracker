from django.conf import settings
from django.core.validators import FileExtensionValidator
from rest_framework import serializers

from apps.resumes.models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    file = serializers.FileField(validators=[FileExtensionValidator(allowed_extensions=["pdf"])])

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

    def validate_file(self, value):
        if value.size > settings.MAX_RESUME_FILE_SIZE:
            raise serializers.ValidationError(
                f"Resume file is too large. Max allowed size is {settings.MAX_RESUME_FILE_SIZE // (1024 * 1024)}MB."
            )

        original_position = value.tell()
        signature = value.read(4)
        value.seek(original_position)

        if signature != b"%PDF":
            raise serializers.ValidationError("Uploaded file is not a valid PDF.")

        return value


class ResumeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ("id", "title", "uploaded_at", "updated_at")
        read_only_fields = fields

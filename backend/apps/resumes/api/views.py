from rest_framework import permissions, serializers, viewsets

from apps.applications.api.permissions import IsOwner
from apps.resumes.api.serializers import ResumeListSerializer, ResumeSerializer
from apps.resumes.models import Resume
from apps.resumes.services.text_extractor import extract_text_from_pdf


class ResumeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "list":
            return ResumeListSerializer
        return ResumeSerializer

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get("file")
        extracted_text = extract_text_from_pdf(file_obj) if file_obj else ""

        if file_obj and not extracted_text:
            raise serializers.ValidationError(
                {"file": "We could not extract text from this PDF. Please upload a readable, text-based PDF."}
            )

        serializer.save(user=self.request.user, extracted_text=extracted_text)

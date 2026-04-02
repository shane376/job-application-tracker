from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from apps.applications.models import Application
from apps.resumes.models import Resume

User = get_user_model()


class RunMatchApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="StrongPass123!")
        self.other_user = User.objects.create_user(username="other", password="StrongPass123!")
        self.client.force_authenticate(self.user)

    def test_returns_404_for_other_users_resume(self):
        other_resume = Resume.objects.create(
            user=self.other_user,
            title="Other Resume",
            extracted_text="Python",
            file=SimpleUploadedFile("other.pdf", b"%PDF-1.4\nother", content_type="application/pdf"),
        )

        response = self.client.post(
            "/api/v1/ai/match/",
            {"resume_id": other_resume.id, "job_description": "Python developer"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Resume not found.")

    def test_returns_404_for_other_users_application(self):
        resume = Resume.objects.create(
            user=self.user,
            title="Owner Resume",
            extracted_text="Python",
            file=SimpleUploadedFile("owner.pdf", b"%PDF-1.4\nowner", content_type="application/pdf"),
        )
        other_application = Application.objects.create(
            user=self.other_user,
            company="Other",
            role="Engineer",
            job_description="Python",
        )

        response = self.client.post(
            "/api/v1/ai/match/",
            {"resume_id": resume.id, "application_id": other_application.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Application not found.")

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from apps.applications.models import Application
from apps.ai_matching.models import MatchResult
from apps.ai_matching.services.matching_service import AiMatchingError
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

    def test_requires_job_description_without_application(self):
        resume = Resume.objects.create(
            user=self.user,
            title="Owner Resume",
            extracted_text="Python",
            file=SimpleUploadedFile("owner.pdf", b"%PDF-1.4\nowner", content_type="application/pdf"),
        )

        response = self.client.post("/api/v1/ai/match/", {"resume_id": resume.id}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["detail"],
            "job_description is required when application has no job description.",
        )

    def test_requires_job_description_when_application_has_blank_job_description(self):
        resume = Resume.objects.create(
            user=self.user,
            title="Owner Resume",
            extracted_text="Python",
            file=SimpleUploadedFile("owner.pdf", b"%PDF-1.4\nowner", content_type="application/pdf"),
        )
        application = Application.objects.create(
            user=self.user,
            company="Acme",
            role="Engineer",
            job_description="",
        )

        response = self.client.post(
            "/api/v1/ai/match/",
            {"resume_id": resume.id, "application_id": application.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["detail"],
            "job_description is required when application has no job description.",
        )

    @patch("apps.ai_matching.api.views.analyze_resume_match")
    def test_accepts_non_integer_match_score_and_clamps_value(self, analyze_resume_match_mock):
        analyze_resume_match_mock.return_value = {
            "match_score": "105.7",
            "missing_skills": ["GraphQL"],
            "improvement_suggestions": ["Highlight API projects"],
            "raw_response": {"foo": "bar"},
        }
        resume = Resume.objects.create(
            user=self.user,
            title="Owner Resume",
            extracted_text="Python GraphQL Django",
            file=SimpleUploadedFile("owner.pdf", b"%PDF-1.4\nowner", content_type="application/pdf"),
        )

        response = self.client.post(
            "/api/v1/ai/match/",
            {"resume_id": resume.id, "job_description": "Python GraphQL role"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        match_result = MatchResult.objects.get(id=response.data["id"])
        self.assertEqual(match_result.match_score, 100)
        self.assertEqual(match_result.missing_skills, ["GraphQL"])
        self.assertEqual(match_result.improvement_suggestions, ["Highlight API projects"])

    @patch("apps.ai_matching.api.views.analyze_resume_match")
    def test_returns_502_when_ai_provider_fails(self, analyze_resume_match_mock):
        analyze_resume_match_mock.side_effect = AiMatchingError("Failed to call AI provider.")
        resume = Resume.objects.create(
            user=self.user,
            title="Owner Resume",
            extracted_text="Python GraphQL Django",
            file=SimpleUploadedFile("owner.pdf", b"%PDF-1.4\nowner", content_type="application/pdf"),
        )

        response = self.client.post(
            "/api/v1/ai/match/",
            {"resume_id": resume.id, "job_description": "Python GraphQL role"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertEqual(response.data["detail"], "Failed to call AI provider.")

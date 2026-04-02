from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from apps.resumes.models import Resume

User = get_user_model()


class ResumeApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="StrongPass123!")
        self.other_user = User.objects.create_user(username="other", password="StrongPass123!")
        self.client.force_authenticate(self.user)

    def test_list_is_scoped_to_authenticated_user(self):
        Resume.objects.create(
            user=self.user,
            title="Owner Resume",
            extracted_text="text",
            file=SimpleUploadedFile("owner.pdf", b"%PDF-1.4\nowner", content_type="application/pdf"),
        )
        Resume.objects.create(
            user=self.other_user,
            title="Other Resume",
            extracted_text="text",
            file=SimpleUploadedFile("other.pdf", b"%PDF-1.4\nother", content_type="application/pdf"),
        )

        response = self.client.get("/api/v1/resumes/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Owner Resume")

    def test_rejects_non_pdf_signature_uploads(self):
        response = self.client.post(
            "/api/v1/resumes/",
            {
                "title": "Invalid",
                "file": SimpleUploadedFile("resume.pdf", b"NOTPDF", content_type="application/pdf"),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data)

    def test_rejects_oversized_uploads(self):
        oversized_content = b"%PDF" + (b"a" * settings.MAX_RESUME_FILE_SIZE)
        response = self.client.post(
            "/api/v1/resumes/",
            {
                "title": "Too Big",
                "file": SimpleUploadedFile("big.pdf", oversized_content, content_type="application/pdf"),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data)

    def test_rejects_pdf_when_text_extraction_fails(self):
        from unittest.mock import patch

        with patch("apps.resumes.api.views.extract_text_from_pdf", return_value=""):
            response = self.client.post(
                "/api/v1/resumes/",
                {
                    "title": "Unreadable",
                    "file": SimpleUploadedFile("resume.pdf", b"%PDF-1.4\nmock", content_type="application/pdf"),
                },
                format="multipart",
            )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("file", response.data)

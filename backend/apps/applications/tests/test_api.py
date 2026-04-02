from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.applications.models import Application

User = get_user_model()


class ApplicationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="StrongPass123!")
        self.other_user = User.objects.create_user(username="other", password="StrongPass123!")
        self.client.force_authenticate(self.user)

    def test_list_is_scoped_to_authenticated_user(self):
        owned = Application.objects.create(user=self.user, company="A", role="Engineer")
        Application.objects.create(user=self.other_user, company="B", role="Analyst")

        response = self.client.get("/api/v1/applications/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], owned.id)

    def test_create_application_ignores_user_in_payload(self):
        payload = {
            "user": self.other_user.id,
            "company": "ACME",
            "role": "Backend Engineer",
            "status": "applied",
        }

        response = self.client.post("/api/v1/applications/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Application.objects.get(id=response.data["id"]).user, self.user)

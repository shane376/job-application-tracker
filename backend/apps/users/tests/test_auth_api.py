from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthApiTests(APITestCase):
    def test_register_rejects_password_mismatch(self):
        payload = {
            "username": "new-user",
            "email": "new@example.com",
            "password": "StrongPass123!",
            "confirm_password": "StrongPass123",
        }

        response = self.client.post("/api/v1/auth/register/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirm_password", response.data)

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user(username="existing", email="existing@example.com", password="StrongPass123!")
        payload = {
            "username": "another",
            "email": "existing@example.com",
            "password": "StrongPass123!",
            "confirm_password": "StrongPass123!",
        }

        response = self.client.post("/api/v1/auth/register/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

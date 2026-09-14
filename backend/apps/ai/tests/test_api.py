from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from apps.ideas.models import Idea


User = get_user_model()


class AIChatAPITests(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            email="api@test.com",
            password="password123",
        )

        self.idea = Idea.objects.create(
            user=self.user,
            title="Mon idée",
        )

        self.client.force_authenticate(
            user=self.user
        )

    def test_chat(self):

        response = self.client.post(
            f"/api/ai/ideas/{self.idea.id}/chat/",
            {
                "message": "Analyse mon idée.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertIn(
            "session_id",
            response.data,
        )

        self.assertIn(
            "message",
            response.data,
        )
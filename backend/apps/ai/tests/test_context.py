from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.ai.context.builder import build_idea_context
from apps.ideas.models import Idea


User = get_user_model()


class IdeaContextTests(TestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            email="context@test.com",
            password="password123",
        )

        self.idea = Idea.objects.create(
            user=self.user,
            title="Application immobilière",
            description="Une application de gestion.",
            problem="Les agents manquent d'organisation.",
            solution="Centraliser les informations.",
            target="Agents immobiliers.",
        )

    def test_context_contains_idea_data(self):

        context = build_idea_context(
            self.idea
        )

        self.assertIn(
            "Application immobilière",
            context,
        )

        self.assertIn(
            "Les agents manquent d'organisation.",
            context,
        )

        self.assertIn(
            "Agents immobiliers.",
            context,
        )
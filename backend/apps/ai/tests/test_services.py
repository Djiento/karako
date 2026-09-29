from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.ai.providers.mock import MockAIProvider
from apps.ai.services import challenge_idea, structure_idea
from apps.ideas.models import Idea


User = get_user_model()


class AIServicesTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="ai@test.com",
            password="testpassword123",
        )

        self.idea = Idea.objects.create(
            user=self.user,
            title="Marketplace locale",
            description=(
                "Une marketplace permettant aux commerces "
                "locaux de vendre leurs produits."
            ),
            problem="Les petits commerces manquent de visibilité.",
            solution="Une marketplace locale.",
            target="Petits commerces.",
        )

        self.provider = MockAIProvider()

    def test_structure_idea_returns_expected_structure(self):
        result = structure_idea(
            idea=self.idea,
            provider=self.provider,
        )

        self.assertIsInstance(result, dict)

        self.assertIn("problem", result)
        self.assertIn("solution", result)
        self.assertIn("target", result)
        self.assertIn("hypotheses", result)
        self.assertIn("open_questions", result)
        self.assertIn("next_action", result)

        self.assertIsInstance(
            result["hypotheses"],
            list,
        )

        self.assertIsInstance(
            result["open_questions"],
            list,
        )

    def test_challenge_idea_returns_expected_structure(self):
        result = challenge_idea(
            idea=self.idea,
            provider=self.provider,
        )

        self.assertIsInstance(result, dict)

        self.assertIn("hypotheses", result)
        self.assertIn("risks", result)
        self.assertIn("critical_questions", result)
        self.assertIn("missing_information", result)
        self.assertIn("next_action", result)

        self.assertIsInstance(
            result["risks"],
            list,
        )

        self.assertIsInstance(
            result["critical_questions"],
            list,
        )
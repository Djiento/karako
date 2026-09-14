from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.ai.actions import apply_ai_action
from apps.ai.models import (
    AIAction,
    AIActionStatus,
    AIActionType,
)
from apps.ideas.models import Idea


User = get_user_model()


class AIActionTests(TestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            email="actions@test.com",
            password="password123",
        )

        self.idea = Idea.objects.create(
            user=self.user,
            title="Test Idea",
        )

    def test_create_hypothesis_action(self):

        action = AIAction.objects.create(
            idea=self.idea,
            user=self.user,
            action_type=(
                AIActionType.CREATE_HYPOTHESIS
            ),
            title="Tester le besoin",
            payload={
                "statement": (
                    "Les utilisateurs ont réellement "
                    "ce problème."
                ),
                "why_important": (
                    "C'est l'hypothèse principale."
                ),
                "confidence": 50,
            },
        )

        result = apply_ai_action(
            action=action,
            user=self.user,
        )

        self.assertIsNotNone(result)

        action.refresh_from_db()

        self.assertEqual(
            action.status,
            AIActionStatus.APPLIED,
        )
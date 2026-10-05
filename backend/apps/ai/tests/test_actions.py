import json

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.ai.models import AIAction
from apps.ai.services import generate_ai_actions
from apps.ideas.models import Idea


User = get_user_model()


class FakeAIProvider:
    name = "test"

    def generate(
        self,
        *,
        system_prompt,
        user_prompt,
    ):
        return json.dumps(
            {
                "actions": [
                    {
                        "action_type": "CREATE_TASK",
                        "title": "Interviewer trois utilisateurs",
                        "description": (
                            "Identifier trois utilisateurs potentiels "
                            "et recueillir leurs besoins."
                        ),
                        "payload": {},
                    },
                    {
                        "action_type": "CREATE_HYPOTHESIS",
                        "title": "Vérifier le besoin utilisateur",
                        "description": (
                            "Les utilisateurs rencontrent réellement "
                            "le problème identifié."
                        ),
                        "payload": {
                            "statement": (
                                "Les utilisateurs rencontrent "
                                "réellement ce problème."
                            )
                        },
                    },
                ]
            }
        )


class AIActionsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="actions@test.com",
            password="TestPassword123!",
        )

        self.idea = Idea.objects.create(
            user=self.user,
            title="Application de test",
            description="Une idée de test.",
        )

    def test_generate_ai_actions(self):
        provider = FakeAIProvider()

        actions = generate_ai_actions(
            idea=self.idea,
            provider=provider,
        )

        self.assertEqual(
            len(actions),
            2,
        )

        self.assertEqual(
            actions[0]["action_type"],
            "CREATE_TASK",
        )

        self.assertEqual(
            actions[1]["action_type"],
            "CREATE_HYPOTHESIS",
        )
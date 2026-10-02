from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from apps.ai.context.builder import build_idea_context
from apps.ideas.models import Capture, Idea
from apps.research.models import ResearchItem

User = get_user_model()

class AIContextTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="context@test.com",
            password="testpassword123",
        )

        self.idea = Idea.objects.create(
            user=self.user,
            title="Application de gestion",
            description="Une application pour gérer une activité.",
        )

    def test_context_contains_idea_information(self):
        context = build_idea_context(
            idea=self.idea,
            user=self.user,
        )

        self.assertIn(
            "Application de gestion",
            context,
        )

        self.assertIn(
            "Une application pour gérer une activité.",
            context,
        )

    def test_context_contains_captures(self):
        Capture.objects.create(
            user=self.user,
            idea=self.idea,
            content="Ajouter une fonctionnalité mobile.",
            capture_type="TEXT",
            captured_at=timezone.now(),
        )

        context = build_idea_context(
            idea=self.idea,
            user=self.user,
        )

        self.assertIn(
            "Ajouter une fonctionnalité mobile.",
            context,
        )

    def test_context_does_not_include_other_user_captures(self):
        other_user = User.objects.create_user(
            email="other@test.com",
            password="testpassword123",
        )

        Capture.objects.create(
            user=other_user,
            idea=self.idea,
            content="CONTENU PRIVÉ AUTRE UTILISATEUR",
            capture_type="TEXT",
            captured_at=timezone.now(),
        )

        context = build_idea_context(
            idea=self.idea,
            user=self.user,
        )

        self.assertNotIn(
            "CONTENU PRIVÉ AUTRE UTILISATEUR",
            context,
        )

    def test_context_contains_research(self):
        ResearchItem.objects.create(
            user=self.user,
            idea=self.idea,
            title="Étude du marché",
            research_type="ARTICLE",
            content="Le marché connaît une forte croissance.",
            notes="Vérifier la source.",
            source="Example",
        )

        context = build_idea_context(
            idea=self.idea,
            user=self.user,
        )

        self.assertIn(
            "Étude du marché",
            context,
        )

        self.assertIn(
            "Le marché connaît une forte croissance.",
            context,
        )

        self.assertIn(
            "[RECHERCHES ASSOCIÉES]",
            context,
        )
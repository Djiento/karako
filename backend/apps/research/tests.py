from django.test import TestCase

# Create your tests here.
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.ideas.models import Idea
from apps.research.models import ResearchItem


User = get_user_model()


class ResearchItemTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="research@test.com",
            password="testpassword123",
        )

        self.other_user = User.objects.create_user(
            email="other-research@test.com",
            password="testpassword123",
        )

        self.idea = Idea.objects.create(
            user=self.user,
            title="Application SaaS",
            description="Une application SaaS.",
        )

        self.other_idea = Idea.objects.create(
            user=self.other_user,
            title="Autre idée",
            description="Une autre idée.",
        )

        self.client.force_authenticate(
            user=self.user,
        )

    def test_create_research_item(self):
        response = self.client.post(
            reverse("research-list"),
            {
                "idea": self.idea.id,
                "title": "Analyse du marché",
                "research_type": "ARTICLE",
                "url": "https://example.com/article",
                "content": "Contenu de la recherche.",
                "notes": "À vérifier.",
                "source": "Example",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        self.assertEqual(
            ResearchItem.objects.count(),
            1,
        )

        research = ResearchItem.objects.first()

        self.assertEqual(
            research.user,
            self.user,
        )

        self.assertEqual(
            research.idea,
            self.idea,
        )

    def test_list_research_for_idea(self):
        ResearchItem.objects.create(
            user=self.user,
            idea=self.idea,
            title="Recherche 1",
        )

        ResearchItem.objects.create(
            user=self.user,
            idea=self.idea,
            title="Recherche 2",
        )

        response = self.client.get(
            reverse("research-list"),
            {
                "idea": self.idea.id,
            },
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            len(response.data),
            2,
        )

    def test_user_cannot_access_other_user_research(self):
        research = ResearchItem.objects.create(
            user=self.other_user,
            idea=self.other_idea,
            title="Recherche privée",
        )

        response = self.client.get(
            reverse(
                "research-detail",
                kwargs={"pk": research.id},
            )
        )

        self.assertEqual(
            response.status_code,
            404,
        )

    def test_user_cannot_attach_research_to_other_user_idea(self):
        response = self.client.post(
            reverse("research-list"),
            {
                "idea": self.other_idea.id,
                "title": "Tentative interdite",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )
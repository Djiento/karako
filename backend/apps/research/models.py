from django.conf import settings
from django.db import models


class ResearchType(models.TextChoices):
    NOTE = "NOTE", "Note"
    URL = "URL", "URL"
    ARTICLE = "ARTICLE", "Article"
    VIDEO = "VIDEO", "Vidéo"
    DOCUMENT = "DOCUMENT", "Document"
    INTERVIEW = "INTERVIEW", "Interview"
    OTHER = "OTHER", "Autre"


class ResearchItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="research_items",
    )

    idea = models.ForeignKey(
        "ideas.Idea",
        on_delete=models.CASCADE,
        related_name="research_items",
    )

    title = models.CharField(max_length=255)

    research_type = models.CharField(
        max_length=20,
        choices=ResearchType.choices,
        default=ResearchType.NOTE,
    )

    url = models.URLField(
        blank=True,
    )

    content = models.TextField(
        blank=True,
    )

    notes = models.TextField(
        blank=True,
    )

    source = models.CharField(
        max_length=255,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title
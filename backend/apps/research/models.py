from django.conf import settings
from django.db import models


class ResearchType(models.TextChoices):
    WEB = "WEB", "Web"
    DOCUMENT = "DOCUMENT", "Document"
    NOTE = "NOTE", "Note"
    INTERVIEW = "INTERVIEW", "Interview"
    OTHER = "OTHER", "Other"


class Research(models.Model):
    idea = models.ForeignKey(
        "ideas.Idea",
        on_delete=models.CASCADE,
        related_name="research",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="research",
    )

    title = models.CharField(max_length=255)

    content = models.TextField()

    research_type = models.CharField(
        max_length=30,
        choices=ResearchType.choices,
        default=ResearchType.NOTE,
    )

    source_url = models.URLField(
        blank=True,
    )

    source_name = models.CharField(
        max_length=255,
        blank=True,
    )

    is_finding = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.title

class ConversationProvider(models.TextChoices):
    CHATGPT = "CHATGPT", "ChatGPT"
    GEMINI = "GEMINI", "Gemini"
    OLLAMA = "OLLAMA", "Ollama"
    OTHER = "OTHER", "Other"


class Conversation(models.Model):
    idea = models.ForeignKey(
        "ideas.Idea",
        on_delete=models.CASCADE,
        related_name="conversations",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations",
    )

    title = models.CharField(
        max_length=255,
    )

    provider = models.CharField(
        max_length=30,
        choices=ConversationProvider.choices,
        default=ConversationProvider.OTHER,
    )

    content = models.TextField()

    summary = models.TextField(
        blank=True,
    )

    source_url = models.URLField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.title
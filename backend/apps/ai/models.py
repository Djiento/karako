from django.conf import settings
from django.db import models


class AIAnalysisType(models.TextChoices):
    STRUCTURE = "STRUCTURE", "Structure"
    CHALLENGE = "CHALLENGE", "Challenge"
    SUMMARY = "SUMMARY", "Summary"


class AIAnalysis(models.Model):
    idea = models.ForeignKey(
        "ideas.Idea",
        on_delete=models.CASCADE,
        related_name="ai_analyses",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_analyses",
    )

    analysis_type = models.CharField(
        max_length=30,
        choices=AIAnalysisType.choices,
    )

    input_context = models.TextField()

    result = models.JSONField()

    provider = models.CharField(
        max_length=50,
        default="mock",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return (
            f"{self.analysis_type} - "
            f"{self.idea.title}"
        )
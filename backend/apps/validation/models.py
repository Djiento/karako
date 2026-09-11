from django.conf import settings
from django.db import models


class HypothesisStatus(models.TextChoices):
    OPEN = "OPEN", "Open"
    TESTING = "TESTING", "Testing"
    VALIDATED = "VALIDATED", "Validated"
    INVALIDATED = "INVALIDATED", "Invalidated"
    ABANDONED = "ABANDONED", "Abandoned"


class Hypothesis(models.Model):
    idea = models.ForeignKey(
        "ideas.Idea",
        on_delete=models.CASCADE,
        related_name="hypotheses",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="hypotheses",
    )

    statement = models.TextField()

    why_important = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=30,
        choices=HypothesisStatus.choices,
        default=HypothesisStatus.OPEN,
    )

    confidence = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.statement[:80]


class ExperimentStatus(models.TextChoices):
    PLANNED = "PLANNED", "Planned"
    RUNNING = "RUNNING", "Running"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class Experiment(models.Model):
    hypothesis = models.ForeignKey(
        Hypothesis,
        on_delete=models.CASCADE,
        related_name="experiments",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="experiments",
    )

    title = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    success_criteria = models.TextField(
        blank=True,
    )

    result = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=30,
        choices=ExperimentStatus.choices,
        default=ExperimentStatus.PLANNED,
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    completed_at = models.DateTimeField(
        null=True,
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


class DecisionType(models.TextChoices):
    CONTINUE = "CONTINUE", "Continue"
    MODIFY = "MODIFY", "Modify"
    PAUSE = "PAUSE", "Pause"
    ABANDON = "ABANDON", "Abandon"


class Decision(models.Model):
    idea = models.ForeignKey(
        "ideas.Idea",
        on_delete=models.CASCADE,
        related_name="decisions",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="decisions",
    )

    decision_type = models.CharField(
        max_length=30,
        choices=DecisionType.choices,
    )

    title = models.CharField(
        max_length=255,
    )

    reasoning = models.TextField()

    evidence = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.title
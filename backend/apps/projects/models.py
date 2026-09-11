from django.conf import settings
from django.db import models


class ProjectStatus(models.TextChoices):
    PLANNED = "PLANNED", "Planned"
    ACTIVE = "ACTIVE", "Active"
    ON_HOLD = "ON_HOLD", "On hold"
    COMPLETED = "COMPLETED", "Completed"
    CANCELLED = "CANCELLED", "Cancelled"


class Project(models.Model):
    idea = models.ForeignKey(
        "ideas.Idea",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )

    name = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=30,
        choices=ProjectStatus.choices,
        default=ProjectStatus.PLANNED,
    )

    start_date = models.DateField(
        null=True,
        blank=True,
    )

    target_date = models.DateField(
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
        return self.name
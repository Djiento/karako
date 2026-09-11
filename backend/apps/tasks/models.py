from django.conf import settings
from django.db import models


class TaskStatus(models.TextChoices):
    TODO = "TODO", "To do"
    IN_PROGRESS = "IN_PROGRESS", "In progress"
    DONE = "DONE", "Done"
    CANCELLED = "CANCELLED", "Cancelled"


class TaskPriority(models.TextChoices):
    LOW = "LOW", "Low"
    MEDIUM = "MEDIUM", "Medium"
    HIGH = "HIGH", "High"
    URGENT = "URGENT", "Urgent"


class Task(models.Model):
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="tasks",
        null=True,
        blank=True,
    )

    idea = models.ForeignKey(
        "ideas.Idea",
        on_delete=models.CASCADE,
        related_name="tasks",
        null=True,
        blank=True,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks",
    )

    title = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=30,
        choices=TaskStatus.choices,
        default=TaskStatus.TODO,
    )

    priority = models.CharField(
        max_length=30,
        choices=TaskPriority.choices,
        default=TaskPriority.MEDIUM,
    )

    due_date = models.DateTimeField(
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
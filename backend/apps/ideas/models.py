from django.conf import settings
from django.db import models


class IdeaStatus(models.TextChoices):
    CAPTURED = "CAPTURED", "Captured"
    UNDERSTANDING = "UNDERSTANDING", "Understanding"
    EXPLORING = "EXPLORING", "Exploring"
    RESEARCHING = "RESEARCHING", "Researching"
    VALIDATING = "VALIDATING", "Validating"
    BUILDING = "BUILDING", "Building"
    LAUNCHED = "LAUNCHED", "Launched"
    ARCHIVED = "ARCHIVED", "Archived"


class Idea(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ideas",
    )

    title = models.CharField(max_length=255)

    description = models.TextField(blank=True)

    problem = models.TextField(blank=True)

    solution = models.TextField(blank=True)

    target = models.TextField(blank=True)

    next_action = models.TextField(blank=True)

    status = models.CharField(
        max_length=30,
        choices=IdeaStatus.choices,
        default=IdeaStatus.CAPTURED,
    )

    score = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    archived_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.title


class CaptureType(models.TextChoices):
    TEXT = "TEXT", "Text"
    VOICE = "VOICE", "Voice"
    IMPORT = "IMPORT", "Import"


class CaptureStatus(models.TextChoices):
    INBOX = "INBOX", "Inbox"
    PROCESSED = "PROCESSED", "Processed"
    DISMISSED = "DISMISSED", "Dismissed"


class Capture(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="captures",
    )

    idea = models.ForeignKey(
        Idea,
        on_delete=models.SET_NULL,
        related_name="captures",
        null=True,
        blank=True,
    )

    content = models.TextField()

    capture_type = models.CharField(
        max_length=20,
        choices=CaptureType.choices,
        default=CaptureType.TEXT,
    )

    source = models.CharField(
        max_length=100,
        blank=True,
    )

    context = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=CaptureStatus.choices,
        default=CaptureStatus.INBOX,
    )

    captured_at = models.DateTimeField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.content[:80]

class Tag(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tags",
    )

    name = models.CharField(max_length=100)

    color = models.CharField(
        max_length=20,
        default="#6366f1",
    )

    ideas = models.ManyToManyField(
        Idea,
        related_name="tags",
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"],
                name="unique_tag_per_user",
            )
        ]

    def __str__(self):
        return self.name
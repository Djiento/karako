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
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.analysis_type} - {self.idea.title}"


class AIChatSession(models.Model):
    idea = models.ForeignKey(
        "ideas.Idea",
        on_delete=models.CASCADE,
        related_name="ai_chat_sessions",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_chat_sessions",
    )
    title = models.CharField(
        max_length=255,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title or f"Chat - {self.idea.title}"


class AIChatMessage(models.Model):

    class Role(models.TextChoices):
        USER = "USER", "User"
        ASSISTANT = "ASSISTANT", "Assistant"

    session = models.ForeignKey(
        AIChatSession,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role} - {self.session.idea.title}"

class AIActionType(models.TextChoices):
    CREATE_HYPOTHESIS = "CREATE_HYPOTHESIS", "Create hypothesis"
    CREATE_TASK = "CREATE_TASK", "Create task"
    CREATE_RESEARCH = "CREATE_RESEARCH", "Create research"
    UPDATE_IDEA = "UPDATE_IDEA", "Update idea"


class AIActionStatus(models.TextChoices):
    PROPOSED = "PROPOSED", "Proposed"
    APPLIED = "APPLIED", "Applied"
    REJECTED = "REJECTED", "Rejected"


class AIAction(models.Model):
    idea = models.ForeignKey(
        "ideas.Idea",
        on_delete=models.CASCADE,
        related_name="ai_actions",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_actions",
    )
    action_type = models.CharField(
        max_length=40,
        choices=AIActionType.choices,
    )
    title = models.CharField(max_length=255)
    payload = models.JSONField(default=dict)
    status = models.CharField(
        max_length=20,
        choices=AIActionStatus.choices,
        default=AIActionStatus.PROPOSED,
    )
    source_analysis = models.ForeignKey(
        "ai.AIAnalysis",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="actions",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    applied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
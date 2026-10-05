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
    class ActionType(models.TextChoices):
        CREATE_TASK = "CREATE_TASK", "Créer une tâche"
        CREATE_HYPOTHESIS = "CREATE_HYPOTHESIS", "Créer une hypothèse"
        ADD_RESEARCH = "ADD_RESEARCH", "Ajouter une recherche"
        UPDATE_IDEA = "UPDATE_IDEA", "Mettre à jour l'idée"
        NEXT_STEP = "NEXT_STEP", "Définir une prochaine étape"

    class Status(models.TextChoices):
        PENDING = "PENDING", "En attente"
        APPLIED = "APPLIED", "Appliquée"
        DISMISSED = "DISMISSED", "Ignorée"

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
        max_length=50,
        choices=ActionType.choices,
    )

    title = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    payload = models.JSONField(
        default=dict,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    applied_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["status", "-created_at"]

    def __str__(self):
        return self.title
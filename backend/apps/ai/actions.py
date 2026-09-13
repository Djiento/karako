from django.utils import timezone

from apps.tasks.models import Task
from apps.validation.models import Hypothesis

from .models import (
    AIAction,
    AIActionStatus,
    AIActionType,
)


def apply_ai_action(
    *,
    action: AIAction,
    user,
):
    if action.user_id != user.id:
        raise PermissionError(
            "Cette action ne vous appartient pas."
        )

    if action.status != AIActionStatus.PROPOSED:
        raise ValueError(
            "Cette action a déjà été traitée."
        )

    payload = action.payload

    if action.action_type == AIActionType.CREATE_HYPOTHESIS:

        hypothesis = Hypothesis.objects.create(
            idea=action.idea,
            user=user,
            statement=payload["statement"],
            why_important=payload.get(
                "why_important",
                "",
            ),
            status="OPEN",
            confidence=payload.get(
                "confidence"
            ),
        )

        action.status = AIActionStatus.APPLIED
        action.applied_at = timezone.now()
        action.save(
            update_fields=[
                "status",
                "applied_at",
            ]
        )

        return hypothesis

    if action.action_type == AIActionType.CREATE_TASK:

        task = Task.objects.create(
            idea=action.idea,
            user=user,
            title=payload["title"],
            description=payload.get(
                "description",
                "",
            ),
            priority=payload.get(
                "priority",
                "MEDIUM",
            ),
            status="TODO",
        )

        action.status = AIActionStatus.APPLIED
        action.applied_at = timezone.now()
        action.save(
            update_fields=[
                "status",
                "applied_at",
            ]
        )

        return task

    raise ValueError(
        f"Action non supportée : "
        f"{action.action_type}"
    )
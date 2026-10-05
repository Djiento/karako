from django.utils import timezone

from apps.tasks.models import Task
from apps.validation.models import Hypothesis

from .models import (
    AIAction,
    AIActionStatus,
    AIActionType,
)


from django.utils import timezone

from apps.validation.models import Hypothesis

from .models import AIAction


def apply_ai_action(
    *,
    action,
    user,
):
    if action.user_id != user.id:
        raise PermissionError(
            "Cette action ne vous appartient pas."
        )

    if action.status != AIAction.Status.PENDING:
        raise ValueError(
            "Cette action a déjà été traitée."
        )

    idea = action.idea

    if action.action_type == AIAction.ActionType.UPDATE_IDEA:
        payload = action.payload or {}

        allowed_fields = {
            "problem",
            "solution",
            "target",
            "next_action",
            "title",
            "description",
        }

        update_fields = []

        for field in allowed_fields:
            if field not in payload:
                continue

            setattr(
                idea,
                field,
                payload[field],
            )

            update_fields.append(field)

        if update_fields:
            update_fields.append("updated_at")

            idea.save(
                update_fields=update_fields,
            )

        result = idea

    elif action.action_type == AIAction.ActionType.CREATE_HYPOTHESIS:
        payload = action.payload or {}

        statement = (
            payload.get("statement")
            or action.description
            or action.title
        )

        hypothesis = Hypothesis.objects.create(
            idea=idea,
            user=user,
            statement=statement,
        )

        result = hypothesis

    elif action.action_type in {
        AIAction.ActionType.NEXT_STEP,
        AIAction.ActionType.CREATE_TASK,
        AIAction.ActionType.ADD_RESEARCH,
    }:
        raise ValueError(
            "Ce type d'action sera relié au module "
            "Projects & Tasks dans le bloc 8."
        )

    else:
        raise ValueError(
            "Type d'action IA non pris en charge."
        )

    action.status = AIAction.Status.APPLIED
    action.applied_at = timezone.now()

    action.save(
        update_fields=[
            "status",
            "applied_at",
        ]
    )

    return result
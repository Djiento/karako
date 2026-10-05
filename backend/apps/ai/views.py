from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ideas.models import Idea
from apps.ideas.serializers import IdeaSerializer
from apps.validation.models import Hypothesis

from .actions import apply_ai_action
from .context.builder import build_idea_context
from .models import (
    AIAction,
    AIAnalysis,
    AIAnalysisType,
    AIChatMessage,
    AIChatSession,
)
from .providers import get_ai_provider
from .serializers import (
    AIActionSerializer,
    AIAnalysisSerializer,
    AIChatMessageSerializer,
    AIChatSessionSerializer,
    ApplyStructureSerializer,
    ChallengeIdeaSerializer,
    ChatMessageSerializer,
    StructureIdeaSerializer,
)
from .services import (
    challenge_idea,
    chat_with_idea,
    structure_idea,
    summarize_idea,
    generate_ai_actions,
)

import logging

logger = logging.getLogger(__name__)



# ============================================================
# STRUCTURE
# ============================================================

class StructureIdeaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):
        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        try:
            provider = get_ai_provider()

            result = structure_idea(
                idea=idea,
                provider=provider,
            )

            serializer = StructureIdeaSerializer(
                data=result,
            )

            if not serializer.is_valid():
                return Response(
                    {
                        "detail": "La réponse IA ne respecte pas le format attendu.",
                        "errors": serializer.errors,
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            context = build_idea_context(
                idea=idea,
                user=request.user,
            )

            analysis = AIAnalysis.objects.create(
                idea=idea,
                user=request.user,
                analysis_type=AIAnalysisType.STRUCTURE,
                input_context=context,
                result=serializer.validated_data,
                provider=provider.__class__.__name__,
            )

            return Response(
                {
                    "idea_id": idea.id,
                    "analysis_type": AIAnalysisType.STRUCTURE,
                    "provider": analysis.provider,
                    "result": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as exc:
            logger.exception(
                "AI STRUCTURE VALIDATION ERROR - idea=%s",
                idea.id,
            )

            return Response(
                {
                    "detail": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        except Exception as exc:
            logger.exception(
                "AI STRUCTURE ERROR - idea=%s",
                idea.id,
            )

            return Response(
                {
                    "detail": (
                        "Une erreur est survenue "
                        "pendant la structuration."
                    ),
                    "error": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

# ============================================================
# APPLY STRUCTURE
# ============================================================


class ApplyStructureView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, idea_id):
        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        serializer = ApplyStructureSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        data = serializer.validated_data

        update_fields = []

        for field in (
            "problem",
            "solution",
            "target",
            "next_action",
        ):
            if field in data:
                setattr(
                    idea,
                    field,
                    data[field],
                )

                update_fields.append(field)

        if update_fields:
            idea.status = "UNDERSTANDING"

            update_fields.append("status")
            update_fields.append("updated_at")

            idea.save(
                update_fields=update_fields,
            )

        hypotheses_created = []

        for statement in data.get(
            "hypotheses",
            [],
        ):
            hypothesis = Hypothesis.objects.create(
                idea=idea,
                user=request.user,
                statement=statement,
            )

            hypotheses_created.append(
                {
                    "id": hypothesis.id,
                    "statement": hypothesis.statement,
                    "status": hypothesis.status,
                }
            )

        return Response(
            {
                "idea": IdeaSerializer(
                    idea,
                    context={
                        "request": request,
                    },
                ).data,
                "hypotheses_created": hypotheses_created,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# AI ANALYSES HISTORY
# ============================================================


class IdeaAIAnalysesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, idea_id):
        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        analyses = (
            AIAnalysis.objects
            .filter(
                idea=idea,
                user=request.user,
            )
            .order_by("-created_at")
        )

        serializer = AIAnalysisSerializer(
            analyses,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# ACTION AI
# ============================================================

class GenerateAIActionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):
        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        provider = get_ai_provider()

        try:
            generated_actions = generate_ai_actions(
                idea=idea,
                provider=provider,
            )

        except ValueError as exc:
            return Response(
                {
                    "detail": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": (
                        "Une erreur est survenue "
                        "pendant la génération des actions."
                    ),
                    "error": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        created_actions = []

        for action_data in generated_actions:
            action = AIAction.objects.create(
                idea=idea,
                user=request.user,
                action_type=action_data["action_type"],
                title=action_data["title"],
                description=action_data["description"],
                payload=action_data["payload"],
            )

            created_actions.append(action)

        return Response(
            AIActionSerializer(
                created_actions,
                many=True,
            ).data,
            status=status.HTTP_201_CREATED,
        )

# ============================================================
# CHALLENGE
# ============================================================


class ChallengeIdeaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):
        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        provider = get_ai_provider()

        try:
            result = challenge_idea(
                idea=idea,
                provider=provider,
            )

        except ValueError as exc:
            return Response(
                {
                    "detail": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": (
                        "Une erreur est survenue "
                        "pendant l'analyse de l'idée."
                    ),
                    "error": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = ChallengeIdeaSerializer(
            data=result,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        context = build_idea_context(
            idea=idea,
            user=request.user,
        )

        AIAnalysis.objects.create(
            idea=idea,
            user=request.user,
            analysis_type=AIAnalysisType.CHALLENGE,
            input_context=context,
            result=serializer.validated_data,
            provider=provider.name,
        )

        return Response(
            {
                "idea_id": idea.id,
                "analysis_type": AIAnalysisType.CHALLENGE,
                "provider": provider.name,
                "result": serializer.validated_data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# SUMMARY
# ============================================================


class SummarizeIdeaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):
        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        provider = get_ai_provider()

        try:
            result = summarize_idea(
                idea=idea,
                provider=provider,
            )

        except ValueError as exc:
            return Response(
                {
                    "detail": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": (
                        "Une erreur est survenue "
                        "pendant le résumé de l'idée."
                    ),
                    "error": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        context = build_idea_context(
            idea=idea,
            user=request.user,
        )

        AIAnalysis.objects.create(
            idea=idea,
            user=request.user,
            analysis_type=AIAnalysisType.SUMMARY,
            input_context=context,
            result=result,
            provider=provider.name,
        )

        return Response(
            result,
            status=status.HTTP_200_OK,
        )


# ============================================================
# CHAT IA
# ============================================================


class IdeaChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):
        serializer = ChatMessageSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        session_id = request.data.get(
            "session_id",
        )

        if session_id:
            session = get_object_or_404(
                AIChatSession,
                id=session_id,
                idea=idea,
                user=request.user,
            )
        else:
            session = AIChatSession.objects.create(
                idea=idea,
                user=request.user,
                title=idea.title,
            )

        user_message = AIChatMessage.objects.create(
            session=session,
            role=AIChatMessage.Role.USER,
            content=serializer.validated_data["message"],
        )

        previous_messages = (
            session.messages
            .exclude(id=user_message.id)
            .order_by("created_at")
        )

        messages = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in previous_messages
        ]

        messages.append(
            {
                "role": AIChatMessage.Role.USER,
                "content": user_message.content,
            }
        )

        try:
            assistant_content = chat_with_idea(
                idea=idea,
                messages=messages,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": (
                        "Une erreur est survenue "
                        "pendant la conversation avec l'IA."
                    ),
                    "error": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        assistant_message = AIChatMessage.objects.create(
            session=session,
            role=AIChatMessage.Role.ASSISTANT,
            content=assistant_content,
        )

        session.save(
            update_fields=[
                "updated_at",
            ]
        )

        return Response(
            {
                "session_id": session.id,
                "message": AIChatMessageSerializer(
                    assistant_message,
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# CHAT SESSIONS
# ============================================================


class IdeaChatSessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, idea_id):
        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        sessions = (
            AIChatSession.objects
            .filter(
                idea=idea,
                user=request.user,
            )
            .order_by("-updated_at")
        )

        serializer = AIChatSessionSerializer(
            sessions,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# CHAT HISTORY
# ============================================================


class IdeaChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(
        self,
        request,
        idea_id,
        session_id,
    ):
        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        session = get_object_or_404(
            AIChatSession,
            id=session_id,
            idea=idea,
            user=request.user,
        )

        messages = session.messages.order_by(
            "created_at",
        )

        return Response(
            {
                "session": AIChatSessionSerializer(
                    session,
                ).data,
                "messages": AIChatMessageSerializer(
                    messages,
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# AI ACTIONS
# ============================================================


class IdeaAIActionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, idea_id):
        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        actions = (
            AIAction.objects
            .filter(
                idea=idea,
                user=request.user,
            )
            .order_by("-created_at")
        )

        serializer = AIActionSerializer(
            actions,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# APPLY AI ACTION
# ============================================================


class ApplyAIActionView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(
        self,
        request,
        idea_id,
        action_id,
    ):
        action = get_object_or_404(
            AIAction,
            id=action_id,
            idea_id=idea_id,
            user=request.user,
        )

        try:
            result = apply_ai_action(
                action=action,
                user=request.user,
            )

        except (
            PermissionError,
            ValueError,
            KeyError,
        ) as exc:
            return Response(
                {
                    "detail": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "action": AIActionSerializer(
                    action,
                ).data,
                "result": {
                    "id": result.id,
                },
            },
            status=status.HTTP_200_OK,
        )
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.validation.models import Hypothesis
from apps.ideas.models import Idea
from .services import (challenge_idea, structure_idea, summarize_idea, build_idea_context, chat_with_idea,)
from django.db import transaction
from .models import AIAnalysis, AIAnalysisType
from django.shortcuts import get_object_or_404
from .models import AIChatMessage, AIChatSession
from .serializers import (
    AIChatMessageSerializer,
    AIChatSessionSerializer,
    ChatMessageSerializer,
    ApplyStructureSerializer,)
from .actions import apply_ai_action
from .models import AIAction
from .serializers import AIActionSerializer




class StructureIdeaView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, idea_id):

        try:
            idea = Idea.objects.get(
                id=idea_id,
                user=request.user,
            )
        except Idea.DoesNotExist:
            return Response(
                {"detail": "Idée introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = structure_idea(
            title=idea.title,
            description=idea.description,
        )

        AIAnalysis.objects.create(
            idea=idea,
            user=request.user,
            analysis_type=AIAnalysisType.STRUCTURE,
            input_context=(
                f"Title: {idea.title}\n"
                f"Description: {idea.description}"
            ),
            result=result,
            provider="mock",
)

        return Response(result)


class ChallengeIdeaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):

        try:
            idea = Idea.objects.get(
                id=idea_id,
                user=request.user,
            )
        except Idea.DoesNotExist:
            return Response(
                {"detail": "Idée introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = challenge_idea(
            title=idea.title,
            description=idea.description,
            problem=idea.problem,
            solution=idea.solution,
            target=idea.target,
        )

        AIAnalysis.objects.create(
        idea=idea,
        user=request.user,
        analysis_type=AIAnalysisType.CHALLENGE,
        input_context=(
            f"Title: {idea.title}\n"
            f"Description: {idea.description}\n"
            f"Problem: {idea.problem}\n"
            f"Solution: {idea.solution}\n"
            f"Target: {idea.target}"
        ),
        result=result,
        provider="mock",
)

        return Response(result)

class ApplyStructureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):
        try:
            idea = Idea.objects.get(
                id=idea_id,
                user=request.user,
            )
        except Idea.DoesNotExist:
            return Response(
                {"detail": "Idée introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ApplyStructureSerializer(
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        update_fields = []

        for field in [
            "problem",
            "solution",
            "target",
            "next_action",
        ]:
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

            idea.save(
                update_fields=[
                    *update_fields,
                    "updated_at",
                ]
            )

        hypotheses_created = []

        for statement in data.get("hypotheses", []):
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
                "idea": {
                    "id": idea.id,
                    "title": idea.title,
                    "status": idea.status,
                    "problem": idea.problem,
                    "solution": idea.solution,
                    "target": idea.target,
                    "next_action": idea.next_action,
                },
                "hypotheses_created": hypotheses_created,
            },
            status=status.HTTP_200_OK,
        )
class SummarizeIdeaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):

        try:
            idea = Idea.objects.get(
                id=idea_id,
                user=request.user,
            )
        except Idea.DoesNotExist:
            return Response(
                {"detail": "Idée introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

       
        result = summarize_idea(idea)

        AIAnalysis.objects.create(
            idea=idea,
            user=request.user,
            analysis_type=AIAnalysisType.SUMMARY,
            input_context=build_idea_context(idea),
            result=result,
            provider="mock",
        )

        return Response(result)

class IdeaChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, idea_id):

        serializer = ChatMessageSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        session_id = request.data.get("session_id")

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

        assistant_content = chat_with_idea(
            idea=idea,
            messages=messages,
        )

        assistant_message = AIChatMessage.objects.create(
            session=session,
            role=AIChatMessage.Role.ASSISTANT,
            content=assistant_content,
        )

        session.save(update_fields=["updated_at"])

        return Response(
            {
                "session_id": session.id,
                "message": AIChatMessageSerializer(
                    assistant_message
                ).data,
            },
            status=status.HTTP_200_OK,
        )

class IdeaChatSessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, idea_id):

        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        sessions = AIChatSession.objects.filter(
            idea=idea,
            user=request.user,
        )

        serializer = AIChatSessionSerializer(
            sessions,
            many=True,
        )

        return Response(serializer.data)


class IdeaChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, idea_id, session_id):

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

        messages = session.messages.all()

        serializer = AIChatMessageSerializer(
            messages,
            many=True,
        )

        return Response(
            {
                "session": AIChatSessionSerializer(
                    session
                ).data,
                "messages": serializer.data,
            }
        )

class IdeaAIActionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, idea_id):

        idea = get_object_or_404(
            Idea,
            id=idea_id,
            user=request.user,
        )

        actions = AIAction.objects.filter(
            idea=idea,
            user=request.user,
        )

        return Response(
            AIActionSerializer(
                actions,
                many=True,
            ).data
        )

class ApplyAIActionView(APIView):
    permission_classes = [IsAuthenticated]

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
                    action
                ).data,
                "result": {
                    "id": result.id,
                },
            },
            status=status.HTTP_200_OK,
        )
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.validation.models import Hypothesis
from apps.ideas.models import Idea
from .serializers import ApplyStructureSerializer
from .services import challenge_idea, structure_idea
from django.db import transaction


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
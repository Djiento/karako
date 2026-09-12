from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ideas.models import Idea
from .services import challenge_idea, structure_idea


class StructureIdeaView(APIView):
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
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Conversation, Research
from .serializers import (
    ConversationSerializer,
    ResearchSerializer,
)


class ResearchViewSet(viewsets.ModelViewSet):

    serializer_class = ResearchSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return (
            Research.objects
            .filter(user=self.request.user)
            .select_related("idea")
            .order_by("-created_at")
        )

    def get_queryset(self):

        queryset = (
            Research.objects
            .filter(user=self.request.user)
            .select_related("idea")
    )

        idea_id = self.request.query_params.get("idea")

        if idea_id:
                queryset = queryset.filter(
                idea_id=idea_id
            )
        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )


class ConversationViewSet(viewsets.ModelViewSet):

    serializer_class = ConversationSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return (
            Conversation.objects
            .filter(user=self.request.user)
            .select_related("idea")
            .order_by("-updated_at")
        )

    def get_queryset(self):

        queryset = (
            Conversation.objects
            .filter(user=self.request.user)
            .select_related("idea")
    )

        idea_id = self.request.query_params.get("idea")

        if idea_id:
            queryset = queryset.filter(
                idea_id=idea_id
            )

        return queryset.order_by("-updated_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )
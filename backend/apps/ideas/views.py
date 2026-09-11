from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Capture, CaptureStatus, Idea, Tag
from .serializers import IdeaSerializer
from .capture_serializers import CaptureSerializer
from .tag_serializers import TagSerializer


class IdeaViewSet(viewsets.ModelViewSet):

    serializer_class = IdeaSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return (
            Idea.objects
            .filter(user=self.request.user)
            .order_by("-updated_at")
        )

    def get_queryset(self):
        
        queryset = Capture.objects.filter(
        user=self.request.user
    )

        capture_status = self.request.query_params.get("status")

        if capture_status:
            queryset = queryset.filter(
            status=capture_status
        )

        return queryset.order_by("-captured_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def archive(self, request, pk=None):

        idea = self.get_object()

        idea.status = "ARCHIVED"
        idea.archived_at = timezone.now()

        idea.save(
            update_fields=[
                "status",
                "archived_at",
                "updated_at",
            ]
        )

        return Response(
            IdeaSerializer(idea).data,
            status=status.HTTP_200_OK,
        )

class CaptureViewSet(viewsets.ModelViewSet):

    serializer_class = CaptureSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return (
            Capture.objects
            .filter(user=self.request.user)
            .order_by("-captured_at")
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            captured_at=timezone.now(),
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def dismiss(self, request, pk=None):

        capture = self.get_object()

        capture.status = CaptureStatus.DISMISSED
        capture.save(
            update_fields=["status"]
        )

        return Response(
            CaptureSerializer(capture).data
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def process(self, request, pk=None):

        capture = self.get_object()

        capture.status = CaptureStatus.PROCESSED

        capture.save(
            update_fields=["status"]
        )

        return Response(
            CaptureSerializer(capture).data
        )

class TagViewSet(viewsets.ModelViewSet):

    serializer_class = TagSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return Tag.objects.filter(
            user=self.request.user
        ).order_by("name")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )
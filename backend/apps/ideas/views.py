from django.db import transaction
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Capture, CaptureStatus, Idea, IdeaStatus, Tag
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

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def archive(self, request, pk=None):

        idea = self.get_object()

        idea.status = IdeaStatus.ARCHIVED
        idea.archived_at = timezone.now()

        idea.save(
            update_fields=[
                "status",
                "archived_at",
                "updated_at",
            ]
        )

        return Response(
            IdeaSerializer(
                idea,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )


class CaptureViewSet(viewsets.ModelViewSet):

    serializer_class = CaptureSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        queryset = (
            Capture.objects
            .filter(user=self.request.user)
            .order_by("-captured_at")
        )

        capture_status = self.request.query_params.get(
            "status"
        )

        if capture_status:
            queryset = queryset.filter(
                status=capture_status
            )

        return queryset

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
            CaptureSerializer(
                capture,
                context={"request": request},
            ).data
        )

    @action(
        detail=True,
        methods=["post"],
    )
    @transaction.atomic
    def process(self, request, pk=None):

        capture = self.get_object()

        # Une capture déjà traitée ou ignorée
        # ne doit pas pouvoir être transformée
        # une nouvelle fois.
        if capture.status != CaptureStatus.INBOX:
            return Response(
                {
                    "detail": (
                        "Cette capture ne peut plus "
                        "être traitée."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Si la capture possède déjà une idée,
        # on évite une création en double.
        if capture.idea_id:
            return Response(
                {
                    "detail": (
                        "Cette capture est déjà liée "
                        "à une idée."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Création de l'idée à partir de la capture.
        idea = Idea.objects.create(
            user=request.user,
            title=capture.content[:255],
            description=capture.content,
            status=IdeaStatus.CAPTURED,
        )

        # On conserve la traçabilité entre
        # la pensée originale et l'idée créée.
        capture.idea = idea
        capture.status = CaptureStatus.PROCESSED

        capture.save(
            update_fields=[
                "idea",
                "status",
            ]
        )

        return Response(
            {
                "idea": IdeaSerializer(
                    idea,
                    context={"request": request},
                ).data,
                "capture": CaptureSerializer(
                    capture,
                    context={"request": request},
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )


class TagViewSet(viewsets.ModelViewSet):

    serializer_class = TagSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return (
            Tag.objects
            .filter(user=self.request.user)
            .order_by("name")
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )
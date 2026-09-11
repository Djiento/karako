from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Project, ProjectStatus
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):

    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Project.objects
            .filter(user=self.request.user)
            .select_related("idea")
        )

        project_status = self.request.query_params.get("status")

        if project_status:
            queryset = queryset.filter(
                status=project_status
            )

        return queryset.order_by("-updated_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )

    @action(
        detail=True,
        methods=["post"],
    )
    def complete(self, request, pk=None):

        project = self.get_object()

        project.status = ProjectStatus.COMPLETED
        project.completed_at = timezone.now()

        project.save(
            update_fields=[
                "status",
                "completed_at",
                "updated_at",
            ]
        )

        return Response(
            ProjectSerializer(project).data,
            status=status.HTTP_200_OK,
        )
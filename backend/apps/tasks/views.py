from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Task, TaskStatus
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):

    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Task.objects
            .filter(user=self.request.user)
            .select_related("project", "idea")
        )

        task_status = self.request.query_params.get("status")
        priority = self.request.query_params.get("priority")
        project_id = self.request.query_params.get("project")
        idea_id = self.request.query_params.get("idea")

        if task_status:
            queryset = queryset.filter(
                status=task_status
            )

        if priority:
            queryset = queryset.filter(
                priority=priority
            )

        if project_id:
            queryset = queryset.filter(
                project_id=project_id
            )

        if idea_id:
            queryset = queryset.filter(
                idea_id=idea_id
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

        task = self.get_object()

        task.status = TaskStatus.DONE
        task.completed_at = timezone.now()

        task.save(
            update_fields=[
                "status",
                "completed_at",
                "updated_at",
            ]
        )

        return Response(
            TaskSerializer(task).data,
            status=status.HTTP_200_OK,
        )
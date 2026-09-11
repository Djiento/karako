from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Decision, Experiment, Hypothesis
from .serializers import (
    DecisionSerializer,
    ExperimentSerializer,
    HypothesisSerializer,
)


class HypothesisViewSet(viewsets.ModelViewSet):

    serializer_class = HypothesisSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Hypothesis.objects
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


class ExperimentViewSet(viewsets.ModelViewSet):

    serializer_class = ExperimentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Experiment.objects
            .filter(user=self.request.user)
            .select_related("hypothesis")
        )

        hypothesis_id = self.request.query_params.get(
            "hypothesis"
        )

        if hypothesis_id:
            queryset = queryset.filter(
                hypothesis_id=hypothesis_id
            )

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )


class DecisionViewSet(viewsets.ModelViewSet):

    serializer_class = DecisionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Decision.objects
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
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import ResearchItem
from .serializers import ResearchItemSerializer


class ResearchItemViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            ResearchItem.objects
            .filter(user=self.request.user)
            .select_related("idea")
            .order_by("-updated_at")
        )

        idea_id = self.request.query_params.get("idea")

        if idea_id:
            queryset = queryset.filter(idea_id=idea_id)

        research_type = self.request.query_params.get(
            "research_type"
        )

        if research_type:
            queryset = queryset.filter(
                research_type=research_type
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
        )
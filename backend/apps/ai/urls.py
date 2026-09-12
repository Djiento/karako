from django.urls import path

from .views import ChallengeIdeaView, StructureIdeaView, ApplyStructureView


urlpatterns = [
    path(
        "ideas/<int:idea_id>/structure/",
        StructureIdeaView.as_view(),
        name="ai-structure-idea",
    ),
    path(
        "ideas/<int:idea_id>/challenge/",
        ChallengeIdeaView.as_view(),
        name="ai-challenge-idea",
    ),
    path(
        "ideas/<int:idea_id>/apply-structure/",
        ApplyStructureView.as_view(),
        name="ai-apply-structure",
    ),
]
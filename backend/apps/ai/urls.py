from django.urls import path

from .views import ChallengeIdeaView, StructureIdeaView


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
]
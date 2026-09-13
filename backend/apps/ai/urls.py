from django.urls import path

from .views import (
    ApplyStructureView,
    ChallengeIdeaView,
    IdeaChatHistoryView,
    IdeaChatSessionsView,
    IdeaChatView,
    StructureIdeaView,
    SummarizeIdeaView,
    IdeaAIActionsView,
    ApplyAIActionView,
)


urlpatterns = [
    path(
        "ideas/<int:idea_id>/structure/",
        StructureIdeaView.as_view(),
        name="ai-structure-idea",
    ),
    path(
        "ideas/<int:idea_id>/structure/apply/",
        ApplyStructureView.as_view(),
        name="ai-apply-structure",
    ),
    path(
        "ideas/<int:idea_id>/challenge/",
        ChallengeIdeaView.as_view(),
        name="ai-challenge-idea",
    ),
    path(
        "ideas/<int:idea_id>/summary/",
        SummarizeIdeaView.as_view(),
        name="ai-summarize-idea",
    ),

    # Chat IA
    path(
        "ideas/<int:idea_id>/chat/",
        IdeaChatView.as_view(),
        name="ai-chat",
    ),
    path(
        "ideas/<int:idea_id>/chat/sessions/",
        IdeaChatSessionsView.as_view(),
        name="ai-chat-sessions",
    ),
    path(
        "ideas/<int:idea_id>/chat/sessions/<int:session_id>/",
        IdeaChatHistoryView.as_view(),
        name="ai-chat-history",
    ),
    path(
        "ideas/<int:idea_id>/actions/",
        IdeaAIActionsView.as_view(),
        name="ai-actions",
),

    path(
        "ideas/<int:idea_id>/actions/<int:action_id>/apply/",
        ApplyAIActionView.as_view(),
        name="ai-action-apply",
    ),
]
from .providers.base import AIProvider
from .providers.mock import MockAIProvider
from apps.research.models import Conversation, Research


def get_ai_provider() -> AIProvider:
    return MockAIProvider()


def structure_idea(
    title: str,
    description: str,
) -> dict:
    provider = get_ai_provider()

    return provider.structure_idea(
        title=title,
        description=description,
    )


def challenge_idea(
    title: str,
    description: str,
    problem: str,
    solution: str,
    target: str,
) -> dict:
    provider = get_ai_provider()

    return provider.challenge_idea(
        title=title,
        description=description,
        problem=problem,
        solution=solution,
        target=target,
    )


def summarize(content: str) -> dict:
    provider = get_ai_provider()

    return provider.summarize(content)


def summarize_idea(idea) -> dict:
    provider = get_ai_provider()

    content = build_idea_context(idea)

    return provider.summarize(
        content=content,
    )


def build_idea_context(idea) -> str:
    parts = []

    parts.append(f"# Idée\n{idea.title}")

    if idea.description:
        parts.append(
            f"# Description\n{idea.description}"
        )

    if idea.problem:
        parts.append(
            f"# Problème\n{idea.problem}"
        )

    if idea.solution:
        parts.append(
            f"# Solution\n{idea.solution}"
        )

    if idea.target:
        parts.append(
            f"# Cible\n{idea.target}"
        )

    researches = Research.objects.filter(
        idea=idea,
        user=idea.user,
    ).order_by("created_at")

    if researches.exists():
        research_parts = ["# Recherches"]

        for research in researches:
            research_parts.append(
                f"## {research.title}\n"
                f"{research.content}"
            )

        parts.append("\n".join(research_parts))

    conversations = Conversation.objects.filter(
        idea=idea,
        user=idea.user,
    ).order_by("created_at")

    if conversations.exists():
        conversation_parts = ["# Conversations"]

        for conversation in conversations:
            conversation_parts.append(
                f"## {conversation.title}\n"
                f"{conversation.content}"
            )

            if conversation.summary:
                conversation_parts.append(
                    f"Résumé : {conversation.summary}"
                )

        parts.append("\n".join(conversation_parts))

    return "\n\n".join(parts)
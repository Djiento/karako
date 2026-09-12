from .providers.base import AIProvider
from .providers.mock import MockAIProvider


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
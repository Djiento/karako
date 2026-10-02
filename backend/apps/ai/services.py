import os
import json

from .providers.base import AIProvider
from .providers.mock import MockAIProvider
from apps.research.models import ResearchItem

from apps.ai.context.builder import build_idea_context
from apps.ai.prompts.chat import build_prompt as build_chat_prompt

from apps.ai.prompts.summarize import (
build_prompt as build_summary_prompt,
)
from apps.ai.prompts.challenge_idea import (
SYSTEM_PROMPT as CHALLENGE_SYSTEM_PROMPT,
build_prompt as build_challenge_prompt,
)
from apps.ai.prompts.structure_idea import (
SYSTEM_PROMPT,
build_prompt as build_structure_prompt,
)


def get_ai_provider() -> AIProvider:
    provider_name = os.getenv(
    "AI_PROVIDER",
    "mock",
    ).lower()

    if provider_name == "ollama":
        from .providers.ollama import OllamaProvider

        return OllamaProvider(
            base_url=os.getenv(
                "OLLAMA_BASE_URL",
                "http://localhost:11434",
            ),
            model=os.getenv(
                "OLLAMA_MODEL",
                "gemma3",
            ),
        )

    if provider_name == "gemini":
        from .providers.gemini import GeminiProvider

        api_key = os.getenv(
            "GEMINI_API_KEY",
            "",
        )

        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY est obligatoire pour utiliser Gemini."
            )

        return GeminiProvider(
            api_key=api_key,
            model=os.getenv(
                "GEMINI_MODEL",
                "gemini-3.8-flash",
            ),
        )

    return MockAIProvider()


def summarize(content: str) -> dict:
    provider = get_ai_provider()

    return provider.summarize(
        content=content,
    )

def chat_with_idea(
    *,
    idea,
    messages: list[dict[str, str]],
    provider=None,
) -> str:
    if provider is None:
        provider = get_ai_provider()

    context = build_idea_context(
        idea=idea,
        user=idea.user,
    )

    return provider.chat(
        context=context,
        messages=messages,
    )


def structure_idea(
    *,
    idea,
    provider,
) -> dict:
    context = build_idea_context(
        idea=idea,
        user=idea.user,
    )

    user_prompt = build_structure_prompt(
        title=idea.title,
        description=idea.description,
        problem=idea.problem,
        solution=idea.solution,
        target=idea.target,
        next_action=idea.next_action,
        context=context,
    )

    raw_result = provider.generate(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
    )

    try:
        result = json.loads(raw_result)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Le provider IA a retourné une réponse JSON invalide."
        ) from exc

    if not isinstance(result, dict):
        raise ValueError(
            "La réponse IA doit être un objet JSON."
        )

    return result


def challenge_idea(
    *,
    idea,
    provider,
) -> dict:
    context = build_idea_context(
        idea=idea,
        user=idea.user,
    )

    user_prompt = build_challenge_prompt(
        title=idea.title,
        description=idea.description,
        problem=idea.problem,
        solution=idea.solution,
        target=idea.target,
        context=context,
    )

    raw_result = provider.generate(
        system_prompt=CHALLENGE_SYSTEM_PROMPT,
        user_prompt=user_prompt,
    )

    try:
        result = json.loads(raw_result)
    except json.JSONDecodeError as exc:
        raise ValueError(
            "Le provider IA a retourné une réponse JSON invalide."
        ) from exc

    if not isinstance(result, dict):
        raise ValueError(
            "La réponse IA doit être un objet JSON."
        )

    return result
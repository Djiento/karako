import os
import json
from .providers.base import AIProvider
from .providers.mock import MockAIProvider
from apps.research.models import Conversation, Research

from apps.ai.prompts.chat import build_prompt as build_chat_prompt
from apps.ai.prompts.challenge_idea import (
    build_prompt as build_challenge_prompt,
)
from apps.ai.prompts.structure_idea import (
    build_prompt as build_structure_prompt,
)
from apps.ai.prompts.summarize import (
    build_prompt as build_summary_prompt,
)

from apps.ai.prompts.structure_idea import (
    build_prompt as build_structure_prompt,
)

from apps.ai.prompts.challenge_idea import (
    SYSTEM_PROMPT as CHALLENGE_SYSTEM_PROMPT,
    build_prompt as build_challenge_prompt,
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
                "GEMINI_API_KEY est obligatoire "
                "pour utiliser Gemini."
            )

        return GeminiProvider(
            api_key=api_key,
            model=os.getenv(
                "GEMINI_MODEL",
                "gemini-3.8-flash",
            ),
        )

    return MockAIProvider()


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


def get_ai_provider() -> AIProvider:
    return MockAIProvider()


def structure_idea(
    *,
    title: str,
    description: str,
) -> dict:
    provider = get_ai_provider()

    return provider.structure_idea(
        title=title,
        description=description,
    )


def challenge_idea(
    *,
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

        parts.append(
            "\n".join(research_parts)
        )

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

        parts.append(
            "\n".join(conversation_parts)
        )

    return "\n\n".join(parts)


def summarize(
    *,
    content: str,
) -> dict:
    provider = get_ai_provider()

    return provider.summarize(
        content=content,
    )


def summarize_idea(idea) -> dict:
    provider = get_ai_provider()

    content = build_idea_context(idea)

    return provider.summarize(
        content=content,
    )


def chat_with_idea(
    *,
    idea,
    messages: list[dict[str, str]],
) -> str:

    provider = get_ai_provider()

    context = build_idea_context(idea)

    return provider.chat(
        context=context,
        messages=messages,
    )


def structure_idea(*, idea, provider) -> dict:
    user_prompt = build_structure_prompt(
        title=idea.title,
        description=idea.description,
        problem=idea.problem,
        solution=idea.solution,
        target=idea.target,
        next_action=idea.next_action,
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

    return {
        "problem": str(
            result.get("problem", "")
        ),
        "solution": str(
            result.get("solution", "")
        ),
        "target": str(
            result.get("target", "")
        ),
        "hypotheses": [
            str(item)
            for item in result.get("hypotheses", [])
            if item
        ],
        "open_questions": [
            str(item)
            for item in result.get("open_questions", [])
            if item
        ],
        "next_action": str(
            result.get("next_action", "")
        ),
    }

def challenge_idea(*, idea, provider) -> dict:
    user_prompt = build_challenge_prompt(
        title=idea.title,
        description=idea.description,
        problem=idea.problem,
        solution=idea.solution,
        target=idea.target,
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

    return {
        "hypotheses": [
            str(item)
            for item in result.get("hypotheses", [])
            if item
        ],
        "risks": [
            str(item)
            for item in result.get("risks", [])
            if item
        ],
        "critical_questions": [
            str(item)
            for item in result.get("critical_questions", [])
            if item
        ],
        "missing_information": [
            str(item)
            for item in result.get("missing_information", [])
            if item
        ],
        "next_action": str(
            result.get("next_action", "")
        ),
    }
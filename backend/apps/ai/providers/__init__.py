import os

from .base import AIProvider
from .gemini import GeminiProvider
from .mock import MockAIProvider
from .ollama import OllamaProvider


def get_ai_provider() -> AIProvider:
    provider_name = os.getenv(
        "AI_PROVIDER",
        "mock",
    ).lower()

    if provider_name == "ollama":
        return OllamaProvider(
            host=os.getenv(
                "OLLAMA_HOST",
                "http://host.docker.internal:11434",
            ),
            model=os.getenv(
                "OLLAMA_MODEL",
                "llama3.2",
            ),
        )

    if provider_name == "gemini":
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY n'est pas configurée."
            )

        return GeminiProvider(
            api_key=api_key,
            model=os.getenv(
                "GEMINI_MODEL",
                "gemini-2.5-flash",
            ),
        )

    return MockAIProvider()
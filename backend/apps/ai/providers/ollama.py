import json
import urllib.error
import urllib.request

from .base import AIProvider


class OllamaProvider(AIProvider):
    name = "ollama"

    def __init__(
        self,
        *,
        host: str = "http://host.docker.internal:11434",
        model: str = "llama3.2",
    ):
        self.host = host.rstrip("/")
        self.model = model

    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        payload = {
            "model": self.model,
            "system": system_prompt,
            "prompt": user_prompt,
            "stream": False,
        }

        request = urllib.request.Request(
            f"{self.host}/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                data = json.loads(
                    response.read().decode("utf-8")
                )
        except urllib.error.URLError as exc:
            raise RuntimeError(
                "Impossible de contacter Ollama."
            ) from exc

        result = data.get("response")

        if not result:
            raise RuntimeError(
                "Ollama a retourné une réponse vide."
            )

        return result
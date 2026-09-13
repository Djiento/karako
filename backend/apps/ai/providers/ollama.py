import json
from urllib.error import URLError
from urllib.request import Request, urlopen

from .base import AIProvider


class OllamaProvider(AIProvider):

    name = "ollama"

    def __init__(
        self,
        *,
        base_url: str = "http://localhost:11434",
        model: str = "gemma3",
        timeout: int = 120,
    ):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            "stream": False,
        }

        request = Request(
            f"{self.base_url}/api/chat",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urlopen(
                request,
                timeout=self.timeout,
            ) as response:

                data = json.loads(
                    response.read().decode("utf-8")
                )

        except URLError as exc:
            raise RuntimeError(
                "Impossible de contacter Ollama."
            ) from exc

        return data["message"]["content"]
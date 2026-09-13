import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .base import AIProvider


class GeminiProvider(AIProvider):

    name = "gemini"

    def __init__(
        self,
        *,
        api_key: str,
        model: str = "gemini-3.8-flash",
        timeout: int = 120,
    ):
        self.api_key = api_key
        self.model = model
        self.timeout = timeout

    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:

        payload = {
            "system_instruction": {
                "parts": [
                    {
                        "text": system_prompt,
                    }
                ]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": user_prompt,
                        }
                    ],
                }
            ],
        }

        url = (
            "https://generativelanguage.googleapis.com/"
            f"v1beta/models/{self.model}:generateContent"
            f"?key={self.api_key}"
        )

        request = Request(
            url,
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

        except HTTPError as exc:
            body = exc.read().decode(
                "utf-8",
                errors="replace",
            )

            raise RuntimeError(
                f"Gemini API error: {body}"
            ) from exc

        except URLError as exc:
            raise RuntimeError(
                "Impossible de contacter Gemini."
            ) from exc

        try:
            return (
                data["candidates"][0]
                ["content"]["parts"][0]["text"]
            )
        except (
            KeyError,
            IndexError,
            TypeError,
        ) as exc:
            raise RuntimeError(
                "Réponse Gemini inattendue."
            ) from exc
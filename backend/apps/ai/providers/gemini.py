import json
import urllib.error
import urllib.request

from .base import AIProvider


class GeminiProvider(AIProvider):
    name = "gemini"

    def __init__(
        self,
        *,
        api_key: str,
        model: str = "gemini-2.5-flash",
    ):
        if not api_key:
            raise ValueError(
                "Une clé API Gemini est requise."
            )

        self.api_key = api_key
        self.model = model

    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/"
            f"models/{self.model}:generateContent"
            f"?key={self.api_key}"
        )

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

        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(
                request,
                timeout=120,
            ) as response:
                data = json.loads(
                    response.read().decode("utf-8")
                )

        except urllib.error.HTTPError as exc:
            body = exc.read().decode(
                "utf-8",
                errors="replace",
            )

            raise RuntimeError(
                f"Gemini a retourné une erreur HTTP "
                f"{exc.code}: {body}"
            ) from exc

        except urllib.error.URLError as exc:
            raise RuntimeError(
                "Impossible de contacter Gemini."
            ) from exc

        candidates = data.get("candidates", [])

        if not candidates:
            raise RuntimeError(
                "Gemini n'a retourné aucune réponse."
            )

        content = candidates[0].get(
            "content",
            {},
        )

        parts = content.get(
            "parts",
            [],
        )

        text_parts = [
            part.get("text", "")
            for part in parts
            if part.get("text")
        ]

        result = "".join(text_parts).strip()

        if not result:
            raise RuntimeError(
                "Gemini a retourné une réponse vide."
            )

        return result
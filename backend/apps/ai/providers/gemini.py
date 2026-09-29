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
            with urllib.request.urlopen(request, timeout=120) as response:
                data = json.loads(
                    response.read().decode("utf-8")
                )
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(
                f"Gemini a retourné une erreur : {body}"
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

        parts = (
            candidates[0]
            .get("content", {})
            .get("parts", [])
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
        def structure_idea(
            self,
            *,
            title: str,
            description: str,
        ) -> dict[str, str]:
            system_prompt = (
                "Tu es un expert en structuration d'idées "
                "et en analyse de problèmes."
            )
            user_prompt = (
                f"Voici une idée :\n\n"
                f"Titre : {title}\n"
                f"Description : {description}\n\n"
                "Peux-tu structurer cette idée en identifiant "
                "le problème, la solution, la cible et les prochaines actions ?"
            )

            result = self.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )

            return json.loads(result)
        def challenge_idea(
            self,
            *,
            title: str,
            description: str,
        ) -> dict[str, str]:
            system_prompt = (
                "Tu es un expert en analyse critique d'idées "
                "et en identification de problèmes."
            )
            user_prompt = (
                f"Voici une idée :\n\n"
                f"Titre : {title}\n"
                f"Description : {description}\n\n"
                "Peux-tu challenger cette idée en identifiant "
                "les problèmes potentiels, les hypothèses et les questions ouvertes ?"
            )

            result = self.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )

            return json.loads(result)
        def generate_idea(
            self,
            *,
            problem: str,
            solution: str,
            target: str,
        ) -> dict[str, str]:
            system_prompt = (
                "Tu es un expert en génération d'idées "
                "et en structuration de concepts."
            )
            user_prompt = (
                f"Voici un problème : {problem}\n"
                f"Voici une solution : {solution}\n"
                f"Voici une cible : {target}\n\n"
                "Peux-tu générer une idée complète en combinant ces éléments ?"
            )

            result = self.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )

            return json.loads(result)

        return result
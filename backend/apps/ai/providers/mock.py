import json

from .base import AIProvider


class MockAIProvider(AIProvider):
    """
    Provider local utilisé pour les tests et le développement
    sans API externe.
    """

    name = "mock"

    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        prompt = (
            f"{system_prompt}\n{user_prompt}"
        ).lower()

        if "risks" in prompt and "critical_questions" in prompt:
            return json.dumps(
                {
                    "hypotheses": [
                        "Les utilisateurs rencontrent réellement le problème décrit.",
                        "La solution proposée répond à une partie significative du problème.",
                    ],
                    "risks": [
                        "Le besoin réel des utilisateurs reste à valider.",
                        "La solution pourrait nécessiter des ajustements après les premiers tests.",
                    ],
                    "critical_questions": [
                        "Qui rencontre ce problème le plus souvent ?",
                        "Quelle solution utilise actuellement la cible ?",
                    ],
                    "missing_information": [
                        "Données réelles sur le comportement des utilisateurs.",
                        "Retour direct de plusieurs utilisateurs cibles.",
                    ],
                    "next_action": (
                        "Interroger au moins trois utilisateurs correspondant "
                        "à la cible."
                    ),
                },
                ensure_ascii=False,
            )

        if '"summary"' in prompt:
            return json.dumps(
                {
                    "summary": (
                        "Synthèse automatique de démonstration "
                        "générée par Karako."
                    ),
                    "key_points": [
                        "Point important identifié.",
                        "Information nécessitant une validation.",
                    ],
                    "next_action": "Valider le point principal avec une source réelle.",
                },
                ensure_ascii=False,
            )

        if "conversation" in prompt or "réponds naturellement" in prompt:
            return (
                "Je peux t'aider à analyser cette idée, identifier les "
                "hypothèses importantes et déterminer la prochaine action."
            )

        return json.dumps(
            {
                "problem": "Le problème principal doit encore être précisé.",
                "solution": "Une solution numérique est envisagée.",
                "target": "La cible doit encore être précisée.",
                "hypotheses": [
                    "Le problème existe réellement pour la cible.",
                    "La solution envisagée apporte une valeur identifiable.",
                ],
                "open_questions": [
                    "Qui est précisément la cible ?",
                    "Comment le problème est-il actuellement résolu ?",
                ],
                "next_action": (
                    "Interroger quelques utilisateurs potentiels "
                    "pour valider le problème."
                ),
            },
            ensure_ascii=False,
        )
import json

from .base import AIProvider


class MockAIProvider(AIProvider):
    name = "mock"

    def generate(self, *, system_prompt: str, user_prompt: str) -> str:
        return json.dumps(
            {
                "problem": (
                    "Le problème doit être mieux défini à partir "
                    "des informations actuellement disponibles."
                ),
                "solution": (
                    "La solution proposée consiste à transformer "
                    "l'idée en produit numérique structuré."
                ),
                "target": (
                    "Utilisateurs confrontés au problème décrit "
                    "dans l'idée."
                ),
                "hypotheses": [
                    "Le problème identifié concerne réellement une cible identifiable.",
                    "La cible serait prête à utiliser une solution adaptée.",
                ],
                "open_questions": [
                    "Qui rencontre le problème le plus souvent ?",
                    "Quelle solution utilise actuellement la cible ?",
                    "Quel serait le premier cas d'usage à valider ?",
                ],
                "next_action": (
                    "Interroger 3 utilisateurs potentiels afin de "
                    "valider le problème."
                ),
            },
            ensure_ascii=False,
        )
    def structure_idea(
        self,
        *,
        title: str,
        description: str,
    ) -> dict[str, str]:
        return {
            "title": title,
            "description": description,
            "problem": (
                "Le problème doit être mieux défini à partir "
                "des informations actuellement disponibles."
            ),
            "solution": (
                "La solution proposée consiste à transformer "
                "l'idée en produit numérique structuré."
            ),
            "target": (
                "Utilisateurs confrontés au problème décrit "
                "dans l'idée."
            ),
            "next_action": (
                "Interroger 3 utilisateurs potentiels afin de "
                "valider le problème."
            ),
        }
    def challenge_idea(
        self,
        *,
        title: str,
        description: str,
        problem: str,
        solution: str,
        target: str,
    ) -> dict[str, str]:
        return {
            "title": title,
            "description": description,
            "problem": problem,
            "solution": solution,
            "target": target,
            "hypotheses": [
                "Le problème identifié concerne réellement une cible identifiable.",
                "La cible serait prête à utiliser une solution adaptée.",
            ],
            "open_questions": [
                "Qui rencontre le problème le plus souvent ?",
                "Quelle solution utilise actuellement la cible ?",
                "Quel serait le premier cas d'usage à valider ?",
            ],
            "next_action": (
                "Interroger 3 utilisateurs potentiels afin de "
                "valider le problème."
            ),
        }
    def summarize(
        self,
        *,
        content: str,
    ) -> dict[str, str]:
        return {
            "summary": (
                "Le contenu fourni est un résumé de l'idée et "
                "de ses aspects clés."
            ),
        }
    def chat(
        self,
        *,
        context: str,
        messages: list[dict[str, str]],
    ) -> str:
        return (
            "Réponse simulée à la conversation basée sur le "
            "contexte et les messages fournis."
        )
    
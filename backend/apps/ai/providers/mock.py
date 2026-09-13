from typing import Any

from .base import AIProvider


class MockAIProvider(AIProvider):

    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:

        return (
            "Réponse simulée par le provider Mock de Karako.\n\n"
            "Le contexte et le prompt ont bien été transmis "
            "au moteur IA."
        )

    def structure_idea(
        self,
        *,
        title: str,
        description: str,
    ) -> dict[str, Any]:

        return {
            "problem": "Problème identifié par le moteur IA.",
            "solution": "Solution proposée à partir de l'idée.",
            "target": "Cible potentielle.",
            "hypotheses": [
                "Les utilisateurs rencontrent réellement ce problème.",
                "La solution proposée répond au besoin.",
                "Les utilisateurs sont prêts à adopter la solution.",
            ],
            "questions": [
                "Quel est le problème le plus important à résoudre ?",
                "Qui rencontre ce problème le plus souvent ?",
                "Comment vérifier cette hypothèse rapidement ?",
            ],
            "next_action": (
                "Interroger quelques utilisateurs potentiels "
                "pour vérifier le problème."
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
    ) -> dict[str, Any]:

        return {
            "strengths": [
                "Le problème semble clairement identifiable.",
                "La solution peut être testée rapidement.",
            ],
            "risks": [
                "Le besoin réel des utilisateurs doit être confirmé.",
                "La proposition de valeur doit être testée.",
            ],
            "questions": [
                "Existe-t-il déjà des solutions concurrentes ?",
                "Pourquoi un utilisateur choisirait cette solution ?",
            ],
            "recommendation": (
                "Valider d'abord le problème auprès "
                "d'utilisateurs potentiels."
            ),
        }

    def summarize(
        self,
        *,
        content: str,
    ) -> dict[str, Any]:

        return {
            "summary": (
                "Synthèse simulée du contexte de l'idée."
            ),
            "known": [
                "Le contexte contient une idée.",
            ],
            "unknown": [
                "Le besoin réel doit encore être confirmé.",
            ],
            "contradictions": [],
            "next_action": (
                "Identifier l'information la plus importante "
                "à vérifier."
            ),
        }

    def chat(
        self,
        *,
        context: str,
        messages: list[dict[str, str]],
    ) -> str:

        last_message = ""

        if messages:
            last_message = messages[-1].get(
                "content",
                "",
            )

        return (
            "Réponse simulée du Chat IA Karako.\n\n"
            f"Question : {last_message}\n\n"
            "Le contexte de l'idée a été transmis au moteur IA."
        )
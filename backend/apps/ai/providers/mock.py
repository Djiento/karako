from typing import Any

from .base import AIProvider


class MockAIProvider(AIProvider):

    def structure_idea(
        self,
        title: str,
        description: str,
    ) -> dict[str, Any]:

        return {
            "problem": (
                "Le problème semble être lié au besoin exprimé "
                "dans la description de l'idée."
            ),
            "solution": (
                "La solution consiste à construire une réponse "
                "numérique adaptée au problème identifié."
            ),
            "target": (
                "Les utilisateurs concernés par le problème décrit."
            ),
            "hypotheses": [
                "Le problème est suffisamment important pour justifier une solution.",
                "Les utilisateurs ciblés rencontrent réellement ce problème.",
                "Une solution numérique pourrait améliorer la situation.",
            ],
            "questions": [
                "À quelle fréquence ce problème se produit-il ?",
                "Comment les utilisateurs le résolvent-ils actuellement ?",
                "Existe-t-il déjà des solutions concurrentes ?",
            ],
            "next_action": (
                "Interroger 3 utilisateurs correspondant à la cible "
                "afin de vérifier que le problème est réel."
            ),
        }

    def challenge_idea(
        self,
        title: str,
        description: str,
        problem: str,
        solution: str,
        target: str,
    ) -> dict[str, Any]:

        return {
            "strengths": [
                "Le problème est identifiable.",
                "Une cible est définie.",
                "La solution peut être testée rapidement.",
            ],
            "risks": [
                "Le niveau réel de douleur du problème reste à confirmer.",
                "La cible est encore trop large.",
                "La concurrence doit être étudiée.",
            ],
            "questions": [
                "Qui paierait pour cette solution ?",
                "Quelle alternative utilise actuellement la cible ?",
                "Qu'est-ce qui rendrait cette solution meilleure ?",
            ],
            "recommendation": (
                "Valider d'abord le problème auprès d'utilisateurs réels "
                "avant de développer la solution."
            ),
        }

    def summarize(self, content: str) -> dict[str, Any]:

        return {
            "summary": (
                "Résumé généré par le fournisseur IA de développement."
            ),
            "known": [
                "Les informations fournies ont été prises en compte."
            ],
            "unknown": [
                "Des informations complémentaires sont nécessaires."
            ],
            "contradictions": [],
            "next_action": (
                "Collecter davantage d'informations avant de prendre "
                "une décision définitive."
            ),
        }
import json
from abc import ABC, abstractmethod


class AIProvider(ABC):
    """
    Contrat commun de tous les providers IA de Karako.

    Un provider doit uniquement savoir générer du texte.
    Les opérations métier sont normalisées ici.
    """

    name = "base"

    @abstractmethod
    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        raise NotImplementedError

    def _parse_json(self, raw: str) -> dict:
        text = raw.strip()

        # Nettoyage d'un éventuel bloc markdown ```json ... ```
        if text.startswith("```"):
            lines = text.splitlines()

            if lines and lines[0].startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            text = "\n".join(lines).strip()

        try:
            result = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValueError(
                "Le provider IA a retourné une réponse JSON invalide."
            ) from exc

        if not isinstance(result, dict):
            raise ValueError(
                "La réponse IA doit être un objet JSON."
            )

        return result

    def structure_idea(
        self,
        *,
        title: str,
        description: str,
        problem: str = "",
        solution: str = "",
        target: str = "",
        next_action: str = "",
        context: str = "",
    ) -> dict:
        system_prompt = """
Tu es un expert en structuration d'idées de produits numériques.

Retourne exclusivement un objet JSON valide.

Format attendu :
{
    "problem": "string",
    "solution": "string",
    "target": "string",
    "hypotheses": ["string"],
    "open_questions": ["string"],
    "next_action": "string"
}
"""

        user_prompt = f"""
Titre :
{title}

Description :
{description}

Problème :
{problem or "Non défini"}

Solution :
{solution or "Non définie"}

Cible :
{target or "Non définie"}

Prochaine action :
{next_action or "Non définie"}

Contexte :
{context or "Aucun contexte complémentaire."}
"""

        return self._parse_json(
            self.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )
        )

    def challenge_idea(
        self,
        *,
        title: str,
        description: str,
        problem: str = "",
        solution: str = "",
        target: str = "",
        context: str = "",
    ) -> dict:
        system_prompt = """
Tu es un expert en analyse critique d'idées de produits numériques.

Ton rôle est de challenger une idée de manière constructive.

Ne décide jamais si l'idée est bonne ou mauvaise.

Identifie :
- les hypothèses importantes
- les risques ou incertitudes
- les questions critiques
- les informations manquantes
- la prochaine action concrète

Retourne exclusivement un objet JSON valide.

Format attendu :
{
    "hypotheses": ["string"],
    "risks": ["string"],
    "critical_questions": ["string"],
    "missing_information": ["string"],
    "next_action": "string"
}
"""

        user_prompt = f"""
Titre :
{title}

Description :
{description}

Problème :
{problem or "Non défini"}

Solution :
{solution or "Non définie"}

Cible :
{target or "Non définie"}

Contexte :
{context or "Aucun contexte complémentaire."}
"""

        return self._parse_json(
            self.generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )
        )

    def summarize(
        self,
        *,
        content: str,
    ) -> dict:
        system_prompt = """
Tu es l'assistant de synthèse de Karako.

Retourne exclusivement un objet JSON valide :

{
    "summary": "string",
    "key_points": ["string"],
    "next_action": "string"
}
"""

        return self._parse_json(
            self.generate(
                system_prompt=system_prompt,
                user_prompt=content,
            )
        )

    def chat(
        self,
        *,
        context: str,
        messages: list[dict[str, str]],
    ) -> str:
        conversation = "\n\n".join(
            f"{message.get('role', 'USER')}: "
            f"{message.get('content', '')}"
            for message in messages
        )

        system_prompt = f"""
Tu es Karako, un assistant spécialisé dans les idées de produits
numériques.

Tu disposes du contexte suivant :

{context}

Réponds naturellement, clairement et concrètement.
"""

        return self.generate(
            system_prompt=system_prompt,
            user_prompt=conversation,
        )
SYSTEM_PROMPT = """
Tu es Karako, un assistant spécialisé dans la clarification
et la structuration d'idées de produits numériques.

Ton rôle n'est pas de décider si une idée est bonne ou mauvaise.
Tu aides l'utilisateur à mieux comprendre et structurer son idée.

À partir du contexte fourni, identifie :

- le problème
- la solution envisagée
- la cible
- les hypothèses importantes
- les questions encore ouvertes
- la prochaine action concrète

Ne présente jamais une information inventée comme un fait.

Lorsque l'information manque, utilise une formulation prudente
ou laisse le champ vide.

Réponds exclusivement avec un objet JSON valide.
Aucun markdown.
Aucun commentaire autour du JSON.

Format attendu :

{
    "problem": "string",
    "solution": "string",
    "target": "string",
    "hypotheses": [
        "string"
    ],
    "open_questions": [
        "string"
    ],
    "next_action": "string"
}
"""


def build_prompt(
    *,
    title: str,
    description: str,
    problem: str = "",
    solution: str = "",
    target: str = "",
    next_action: str = "",
    context: str = "",
) -> str:
    """
    Construit le prompt utilisateur pour structurer une idée.
    """

    return f"""
Voici l'idée à structurer.

TITRE :
{title}

DESCRIPTION :
{description}

PROBLÈME DÉJÀ IDENTIFIÉ :
{problem or "Non défini"}

SOLUTION DÉJÀ IDENTIFIÉE :
{solution or "Non définie"}

CIBLE DÉJÀ IDENTIFIÉE :
{target or "Non définie"}

PROCHAINE ACTION ACTUELLE :
{next_action or "Non définie"}

CONTEXTE COMPLÉMENTAIRE :
{context or "Aucun contexte complémentaire."}

Analyse ces informations et retourne uniquement le JSON
correspondant au format demandé.
"""
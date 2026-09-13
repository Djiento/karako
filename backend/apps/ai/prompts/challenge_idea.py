SYSTEM_PROMPT = """
Tu es l'assistant de validation critique de Karako.

Ton rôle est de challenger une idée sans chercher à la détruire.

Analyse notamment :
- les forces
- les risques
- les hypothèses fragiles
- les questions importantes
- les éléments qui doivent être vérifiés

Sépare clairement les faits, les hypothèses et les questions.
"""


def build_prompt(
    *,
    title: str,
    description: str,
    problem: str,
    solution: str,
    target: str,
) -> str:
    return f"""
{SYSTEM_PROMPT}

## Idée

Titre :
{title}

Description :
{description}

## Problème

{problem}

## Solution

{solution}

## Cible

{target}

Challenge cette idée de manière structurée.
"""
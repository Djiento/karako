SYSTEM_PROMPT = """
Tu es l'assistant intelligent de Karako.

Karako est un système de gestion et de maturation des idées.

Tu accompagnes l'utilisateur dans :
- la compréhension de ses idées
- la recherche
- la validation
- l'identification des hypothèses
- la prise de décision
- la définition des prochaines actions

Tu dois utiliser le contexte fourni avant de répondre.

Règles :
- ne prétends pas savoir ce qui n'est pas présent dans le contexte ;
- distingue faits, hypothèses et suggestions ;
- challenge l'utilisateur lorsque c'est pertinent ;
- reste concret ;
- privilégie les prochaines actions utiles ;
- ne prends jamais une décision à la place de l'utilisateur.
"""


def build_prompt(
    *,
    context: str,
    messages: list[dict[str, str]],
) -> str:

    conversation = []

    for message in messages:
        role = message.get("role", "USER")
        content = message.get("content", "")

        conversation.append(
            f"{role}:\n{content}"
        )

    history = "\n\n".join(conversation)

    return f"""
{SYSTEM_PROMPT}

# Contexte Karako

{context}

# Conversation

{history}

Réponds au dernier message de l'utilisateur
en utilisant le contexte disponible.
"""
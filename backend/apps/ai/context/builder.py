from apps.ai.models import AIAnalysis, AIChatSession
from apps.ideas.models import Capture
from apps.research.models import ResearchItem


def build_idea_context(*, idea, user) -> str:
    sections = []

    sections.append(
        f"""
[IDÉE]

Titre :
{idea.title}

Description :
{idea.description or "Non définie"}

Problème :
{idea.problem or "Non défini"}

Solution :
{idea.solution or "Non définie"}

Cible :
{idea.target or "Non définie"}

Prochaine action :
{idea.next_action or "Non définie"}

Statut :
{idea.status}
""".strip()
    )

    captures = (
        Capture.objects
        .filter(
            user=user,
            idea=idea,
        )
        .order_by("-captured_at")[:30]
    )

    if captures:
        capture_lines = []

        for capture in captures:
            capture_lines.append(
                f"""
- [{capture.capture_type}] {capture.content}
  Source : {capture.source or "Inconnue"}
  Contexte : {capture.context or "Aucun"}
""".strip()
            )

        sections.append(
            "[CAPTURES ASSOCIÉES]\n\n"
            + "\n".join(capture_lines)
        )

    research_items = (
        ResearchItem.objects
        .filter(
            user=user,
            idea=idea,
        )
        .order_by("-updated_at")[:30]
    )

    if research_items:
        research_lines = []

        for research in research_items:
            research_lines.append(
                f"""
Titre : {research.title}
Type : {research.research_type}
Source : {research.source or "Inconnue"}
URL : {research.url or "Aucune"}

Contenu :
{research.content or "Aucun contenu."}

Notes :
{research.notes or "Aucune note."}
""".strip()
            )

        sections.append(
            "[RECHERCHES ASSOCIÉES]\n\n"
            + "\n\n".join(research_lines)
        )

    analyses = (
        AIAnalysis.objects
        .filter(
            user=user,
            idea=idea,
        )
        .order_by("-created_at")[:20]
    )

    if analyses:
        analysis_lines = []

        for analysis in analyses:
            analysis_lines.append(
                f"""
Type : {analysis.analysis_type}
Provider : {analysis.provider}
Résultat :
{analysis.result}
""".strip()
            )

        sections.append(
            "[ANALYSES IA PRÉCÉDENTES]\n\n"
            + "\n\n".join(analysis_lines)
        )

    sessions = (
        AIChatSession.objects
        .filter(
            user=user,
            idea=idea,
        )
        .prefetch_related("messages")
        .order_by("-updated_at")[:10]
    )

    chat_lines = []

    for session in sessions:
        messages = session.messages.order_by("created_at")[:50]

        if not messages:
            continue

        chat_lines.append(
            f"Session : {session.title or 'Conversation sans titre'}"
        )

        for message in messages:
            chat_lines.append(
                f"{message.role}: {message.content}"
            )

    if chat_lines:
        sections.append(
            "[CONVERSATIONS IA]\n\n"
            + "\n".join(chat_lines)
        )

    return "\n\n==============================\n\n".join(
        sections
    )
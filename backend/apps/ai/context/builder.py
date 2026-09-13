from apps.ai.models import AIAnalysis
from apps.ideas.models import Idea
from apps.projects.models import Project
from apps.research.models import Conversation, Research
from apps.tasks.models import Task
from apps.validation.models import (
    Decision,
    Experiment,
    Hypothesis,
)


def build_idea_context(idea: Idea) -> str:

    parts = []

    # -------------------------------------------------
    # IDEA
    # -------------------------------------------------

    parts.append(
        "\n".join(
            [
                "# IDÉE",
                f"Titre : {idea.title}",
                f"Description : {idea.description}",
                f"Problème : {idea.problem}",
                f"Solution : {idea.solution}",
                f"Cible : {idea.target}",
                f"Statut : {idea.status}",
                f"Score : {idea.score}",
            ]
        )
    )

    # -------------------------------------------------
    # TAGS
    # -------------------------------------------------

    tags = idea.tags.all()

    if tags.exists():
        tag_lines = ["# TAGS"]

        for tag in tags:
            tag_lines.append(f"- {tag.name}")

        parts.append("\n".join(tag_lines))

    # -------------------------------------------------
    # RESEARCH
    # -------------------------------------------------

    researches = Research.objects.filter(
        idea=idea,
        user=idea.user,
    ).order_by("created_at")

    if researches.exists():
        lines = ["# RECHERCHES"]

        for research in researches:
            lines.append(
                f"""
## {research.title}

Type : {research.research_type}
Source : {research.source_name or research.source_url}

{research.content}
""".strip()
            )

        parts.append("\n\n".join(lines))

    # -------------------------------------------------
    # CONVERSATIONS
    # -------------------------------------------------

    conversations = Conversation.objects.filter(
        idea=idea,
        user=idea.user,
    ).order_by("created_at")

    if conversations.exists():
        lines = ["# CONVERSATIONS"]

        for conversation in conversations:
            lines.append(
                f"""
## {conversation.title}

Provider : {conversation.provider}

{conversation.content}

Résumé :
{conversation.summary}
""".strip()
            )

        parts.append("\n\n".join(lines))

    # -------------------------------------------------
    # HYPOTHESES
    # -------------------------------------------------

    hypotheses = Hypothesis.objects.filter(
        idea=idea,
        user=idea.user,
    ).order_by("created_at")

    if hypotheses.exists():
        lines = ["# HYPOTHÈSES"]

        for hypothesis in hypotheses:
            lines.append(
                f"""
## {hypothesis.statement}

Statut : {hypothesis.status}
Confiance : {hypothesis.confidence}

Pourquoi importante :
{hypothesis.why_important}
""".strip()
            )

        parts.append("\n\n".join(lines))

    # -------------------------------------------------
    # EXPERIMENTS
    # -------------------------------------------------

    experiments = Experiment.objects.filter(
        hypothesis__idea=idea,
        user=idea.user,
    ).order_by("created_at")

    if experiments.exists():
        lines = ["# EXPÉRIMENTATIONS"]

        for experiment in experiments:
            lines.append(
                f"""
## {experiment.title}

Statut : {experiment.status}

Description :
{experiment.description}

Critère de succès :
{experiment.success_criteria}

Résultat :
{experiment.result}
""".strip()
            )

        parts.append("\n\n".join(lines))

    # -------------------------------------------------
    # DECISIONS
    # -------------------------------------------------

    decisions = Decision.objects.filter(
        idea=idea,
        user=idea.user,
    ).order_by("created_at")

    if decisions.exists():
        lines = ["# DÉCISIONS"]

        for decision in decisions:
            lines.append(
                f"""
## {decision.title}

Type : {decision.decision_type}

Raisonnement :
{decision.reasoning}

Évidence :
{decision.evidence}
""".strip()
            )

        parts.append("\n\n".join(lines))

    # -------------------------------------------------
    # PROJECT
    # -------------------------------------------------

    project = Project.objects.filter(
        idea=idea,
        user=idea.user,
    ).first()

    if project:
        parts.append(
            f"""
# PROJET

Nom : {project.name}
Description : {project.description}
Statut : {project.status}
Date de début : {project.start_date}
Date cible : {project.target_date}
""".strip()
        )

    # -------------------------------------------------
    # TASKS
    # -------------------------------------------------

    tasks = Task.objects.filter(
        user=idea.user,
    ).filter(
        idea=idea
    ).order_by("created_at")

    if tasks.exists():
        lines = ["# TÂCHES"]

        for task in tasks:
            lines.append(
                f"""
- {task.title}
  Statut : {task.status}
  Priorité : {task.priority}
  Échéance : {task.due_date}
""".strip()
            )

        parts.append("\n".join(lines))

    # -------------------------------------------------
    # AI ANALYSES
    # -------------------------------------------------

    analyses = AIAnalysis.objects.filter(
        idea=idea,
        user=idea.user,
    ).order_by("-created_at")[:10]

    if analyses:
        lines = ["# ANALYSES IA RÉCENTES"]

        for analysis in analyses:
            lines.append(
                f"""
## {analysis.analysis_type}

Provider : {analysis.provider}

{analysis.result}
""".strip()
            )

        parts.append("\n\n".join(lines))

    return "\n\n".join(parts)
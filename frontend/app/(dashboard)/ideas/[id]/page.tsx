
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ResearchSection from "@/components/ideas/ResearchSection";
import IdeaAISection from "@/components/ai/IdeaAISection";

import {
  ArrowLeft,
  Check,
  Edit3,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useIdea } from "@/hooks/use-ideas";
import {
  updateIdea,
  structureIdea,
  applyStructure,
  challengeIdea,
} from "@/lib/ideas";
import type {
  Idea,
  IdeaStatus,
  IdeaStructure,
  IdeaChallenge,
} from "@/types/idea";

import InboxPage from "@/components/inbox/InboxPage";



const statusLabels: Record<string, string> = {
  CAPTURED: "Capturée",
  UNDERSTANDING: "Compréhension",
  EXPLORING: "Exploration",
  RESEARCHING: "Recherche",
  VALIDATING: "Validation",
  BUILDING: "Construction",
  LAUNCHED: "Lancée",
  ARCHIVED: "Archivée",
};

type EditableField =
  | "title"
  | "description"
  | "problem"
  | "solution"
  | "target"
  | "next_action";

export default function IdeaDetailPage() {
  const params = useParams();

  const id = Number(params.id);

  const {
    idea,
    loading,
    error,
  } = useIdea(id);

  const [draft, setDraft] = useState<Partial<Idea>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const statuses = Object.keys(statusLabels);

  const [structuring, setStructuring] = useState(false);
  const [structure, setStructure] =
    useState<IdeaStructure | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [challenging, setChallenging] = useState(false);
  const [challenge, setChallenge] = useState<IdeaChallenge | null>(null);

  const [applyingStructure, setApplyingStructure] =
    useState(false);
  const [applyError, setApplyError] =
    useState<string | null>(null);

  /**
   * Demande à l'IA de structurer l'idée.
   */
  async function handleStructure() {
    setStructuring(true);
    setAiError(null);

    try {
      const response = await structureIdea(id);

      setStructure(response.result);
    } catch {
      setAiError(
        "Impossible de structurer cette idée avec l'IA.",
      );
    } finally {
      setStructuring(false);
    }
  }

  async function handleChallenge() {
  setChallenging(true);
  setAiError(null);

  try {
    const response = await challengeIdea(id);
    setChallenge(response.result);
  } catch {
    setAiError("Impossible de challenger cette idée avec Karako.");
  } finally {
    setChallenging(false);
  }
}

  /**
   * Applique la structure proposée par l'IA.
   */
  async function handleApplyStructure() {
    if (!structure) return;

    setApplyingStructure(true);
    setAiError(null);
    setApplyError(null);

    try {
      const response = await applyStructure(id, structure);

      setDraft(response.idea);
      setStructure(null);

      window.location.reload();
    } catch {
      setApplyError(
        "Impossible d'appliquer la structure à cette idée.",
      );
    } finally {
      setApplyingStructure(false);
    }
  }

  /**
   * Synchronise le formulaire avec l'idée chargée.
   */
  useEffect(() => {
    if (!idea) {
      return;
    }

    setDraft({
      title: idea.title,
      description: idea.description,
      problem: idea.problem,
      solution: idea.solution,
      target: idea.target,
      next_action: idea.next_action,
      status: idea.status,
    });
  }, [idea]);

  /**
   * Chargement
   */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl text-sm text-slate-500">
        Chargement de l'idée...
      </div>
    );
  }

  /**
   * Erreur / idée inexistante
   */
  if (error || !idea) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl bg-red-50 p-5 text-sm text-red-600">
          {error ?? "Idée introuvable."}
        </div>
      </div>
    );
  }

  /**
   * À partir d'ici, TypeScript sait que currentIdea
   * est obligatoirement une Idea.
   */
  const currentIdea = idea;

  /**
   * Modification d'un champ.
   */
  function updateField(
    field: EditableField,
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /**
   * Annulation des modifications.
   */
  function cancelEditing() {
    setDraft({
      title: currentIdea.title,
      description: currentIdea.description,
      problem: currentIdea.problem,
      solution: currentIdea.solution,
      target: currentIdea.target,
      next_action: currentIdea.next_action,
      status: currentIdea.status,
    });

    setSaveError(null);
    setEditing(false);
  }

  /**
   * Enregistrement des modifications.
   */
  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    try {
      await updateIdea(id, {
        title: String(draft.title ?? ""),
        description: String(draft.description ?? ""),
        problem: String(draft.problem ?? ""),
        solution: String(draft.solution ?? ""),
        target: String(draft.target ?? ""),
        next_action: String(draft.next_action ?? ""),
        status: String(
          draft.status ?? currentIdea.status,
        ) as IdeaStatus,
      });

      /**
       * On recharge la page pour récupérer
       * la version fraîche depuis Django.
       */
      window.location.reload();
    } catch {
      setSaveError(
        "Impossible d'enregistrer les modifications.",
      );
    } finally {
      setSaving(false);
    }
  }

  /**
   * Affichage d'un champ éditable.
   */
  function renderField(
    label: string,
    field: EditableField,
    placeholder: string,
    large = false,
  ) {
    const value = String(draft[field] ?? "");

    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">
            {label}
          </h2>

          {!editing && (
            <Edit3
              size={15}
              className="text-slate-400"
            />
          )}
        </div>

        {editing ? (
          <textarea
            value={value}
            onChange={(event) =>
              updateField(
                field,
                event.target.value,
              )
            }
            rows={large ? 6 : 4}
            placeholder={placeholder}
            className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        ) : (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {value || placeholder}
          </p>
        )}
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Navigation + actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Retour aux idées
        </Link>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Edit3 size={16} />
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <X size={16} />
              Annuler
            </button>
            

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Save size={16} />

              {saving
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>
          </div>
        )}
      </div>

      {/* Erreur sauvegarde */}
      {saveError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {saveError}
        </div>
      )}

      {/* En-tête de l'idée */}
      <header className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-6">
          {/* Statut + score */}
          <div className="flex flex-wrap items-center gap-3">
            {editing ? (
              <select
                value={String(
                  draft.status ??
                    currentIdea.status,
                )}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    status:
                      event.target.value as IdeaStatus,
                  }))
                }
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium outline-none"
              >
                {statuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {statusLabels[currentIdea.status] ??
                  currentIdea.status}
              </span>
            )}

            {currentIdea.score !== null && (
              <span className="text-xs text-slate-500">
                Score : {currentIdea.score}/100
              </span>
            )}
          </div>

          {/* Titre */}
          {editing ? (
            <input
              value={String(
                draft.title ?? "",
              )}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-3xl font-bold tracking-tight outline-none focus:border-slate-400 focus:bg-white"
              placeholder="Titre de l'idée"
            />
          ) : (
            <h1 className="text-3xl font-bold tracking-tight">
              {currentIdea.title}
            </h1>
          )}

          {/* Description */}
          {editing ? (
            <textarea
              value={String(
                draft.description ?? "",
              )}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              rows={5}
              placeholder="Décris ton idée..."
              className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 outline-none focus:border-slate-400 focus:bg-white"
            />
          ) : (
            <p className="max-w-3xl whitespace-pre-wrap text-slate-600">
              {currentIdea.description ||
                "Aucune description."}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleStructure}
              disabled={structuring}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={17} />

              {structuring
                ? "Karako analyse..."
                : "Structurer avec Karako"}
            </button>
            <button
                type="button"
                onClick={handleChallenge}
                disabled={challenging}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles size={17} />
                {challenging ? "Karako challenge..." : "Challenger l'idée"}
            </button>

            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-400"
            >
              <Check size={16} />
              Valider l'idée
            </button>
          </div>
        </div>
      </header>

      {challenge && (
  <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Challenge Karako
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Les points qui méritent d'être vérifiés avant de continuer.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setChallenge(null)}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        Fermer
      </button>
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Hypothèses
        </h3>

        {challenge.hypotheses.length > 0 ? (
          <ul className="space-y-2">
            {challenge.hypotheses.map((item, index) => (
              <li
                key={`hypothesis-${index}`}
                className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">
            Aucune hypothèse identifiée.
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Risques et incertitudes
        </h3>

        {challenge.risks.length > 0 ? (
          <ul className="space-y-2">
            {challenge.risks.map((item, index) => (
              <li
                key={`risk-${index}`}
                className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">
            Aucun risque identifié.
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Questions critiques
        </h3>

        {challenge.critical_questions.length > 0 ? (
          <ul className="space-y-2">
            {challenge.critical_questions.map((item, index) => (
              <li
                key={`question-${index}`}
                className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">
            Aucune question critique identifiée.
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Informations manquantes
        </h3>

        {challenge.missing_information.length > 0 ? (
          <ul className="space-y-2">
            {challenge.missing_information.map((item, index) => (
              <li
                key={`missing-${index}`}
                className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">
            Aucune information manquante identifiée.
          </p>
        )}
      </div>
    </div>

    {challenge.next_action && (
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Prochaine action
        </p>

        <p className="mt-2 text-sm font-medium text-slate-900">
          {challenge.next_action}
        </p>
      </div>
    )}
  </section>
)}

      {/* Erreur IA */}
      {aiError && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {aiError}
        </div>
      )}

      {/* Proposition de structure IA */}
      {structure && (
        <section className="space-y-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} />

              <h2 className="font-semibold">
                Proposition de structuration
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Karako propose cette structure à partir
              du contexte actuel de ton idée.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">
                Problème
              </h3>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {structure.problem ||
                  "Aucune proposition."}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">
                Solution
              </h3>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {structure.solution ||
                  "Aucune proposition."}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">
                Cible
              </h3>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {structure.target ||
                  "Aucune proposition."}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">
                Prochaine action
              </h3>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {structure.next_action ||
                  "Aucune proposition."}
              </p>
            </div>
          </div>

          {/* Hypothèses */}
          {structure.hypotheses.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">
                Hypothèses
              </h3>

              <ul className="mt-3 space-y-2">
                {structure.hypotheses.map(
                  (hypothesis, index) => (
                    <li
                      key={index}
                      className="text-sm leading-6 text-slate-600"
                    >
                      • {hypothesis}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {/* Questions ouvertes */}
          {structure.open_questions.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">
                Questions ouvertes
              </h3>

              <ul className="mt-3 space-y-2">
                {structure.open_questions.map(
                  (question, index) => (
                    <li
                      key={index}
                      className="text-sm leading-6 text-slate-600"
                    >
                      • {question}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {/* Actions structure */}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={handleApplyStructure}
              disabled={applyingStructure}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {applyingStructure
                ? "Application..."
                : "Appliquer la structure"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStructure(null);
                setApplyError(null);
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Fermer
            </button>
          </div>

          {/* Erreur application */}
          {applyError && (
            <p className="mt-3 text-sm text-red-600">
              {applyError}
            </p>
          )}
        </section>
      )}

      {/* Champs principaux */}
      <div className="grid gap-6 md:grid-cols-2">
        {renderField(
          "Problème",
          "problem",
          "Pas encore défini.",
          true,
        )}

        {renderField(
          "Solution",
          "solution",
          "Pas encore définie.",
          true,
        )}

        {renderField(
          "Cible",
          "target",
          "Pas encore définie.",
          false,
        )}

        {renderField(
          "Prochaine action",
          "next_action",
          "Aucune action définie.",
          false,
        )}
      </div>

          <IdeaAISection ideaId={idea.id} />
        
          <ResearchSection ideaId={idea.id} />
          
           

      {/* Informations */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">
          Informations
        </h2>

        <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">
              Créée le
            </p>

            <p className="mt-1 text-slate-600">
              {new Date(
                currentIdea.created_at,
              ).toLocaleString("fr-FR")}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Modifiée le
            </p>

            <p className="mt-1 text-slate-600">
              {new Date(
                currentIdea.updated_at,
              ).toLocaleString("fr-FR")}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Statut
            </p>

            <p className="mt-1 text-slate-600">
              {statusLabels[currentIdea.status] ??
                currentIdea.status}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Check,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";

import {
  applyAIAction,
  generateAIActions,
} from "@/lib/ai";

import type { AIAction } from "@/types/ai";

interface AIActionsPanelProps {
  ideaId: number;
  initialActions?: AIAction[];
}

const actionLabels: Record<string, string> = {
  CREATE_TASK: "Tâche",
  CREATE_HYPOTHESIS: "Hypothèse",
  ADD_RESEARCH: "Recherche",
  UPDATE_IDEA: "Mise à jour",
  NEXT_STEP: "Prochaine étape",
};

export default function AIActionsPanel({
  ideaId,
  initialActions = [],
}: AIActionsPanelProps) {
  const [actions, setActions] =
    useState<AIAction[]>(initialActions);

  const [loading, setLoading] =
    useState(false);

  const [applyingId, setApplyingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const generated =
        await generateAIActions(ideaId);

      setActions(generated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de générer les actions.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleApply(
    actionId: number,
  ) {
    setApplyingId(actionId);
    setError(null);

    try {
      const response =
        await applyAIAction(
          ideaId,
          actionId,
        );

      setActions((current) =>
        current.map((action) =>
          action.id === actionId
            ? response.action
            : action,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'appliquer cette action.",
      );
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />

            <h2 className="text-lg font-semibold">
              Actions IA
            </h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Transforme l’analyse de Karako en prochaines
            actions concrètes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}

          {loading
            ? "Analyse..."
            : "Générer les actions"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {actions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Target className="mx-auto h-8 w-8 text-muted-foreground" />

          <p className="mt-3 font-medium">
            Aucune action proposée
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Lance une analyse pour découvrir les prochaines
            étapes utiles pour cette idée.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => {
            const applied =
              action.status === "APPLIED";

            return (
              <article
                key={action.id}
                className="rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                        {actionLabels[
                          action.action_type
                        ] ?? action.action_type}
                      </span>

                      {applied && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
                          <Check className="h-3 w-3" />
                          Appliquée
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-medium">
                      {action.title}
                    </h3>

                    {action.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    )}
                  </div>

                  {!applied && (
                    <button
                      type="button"
                      onClick={() =>
                        handleApply(action.id)
                      }
                      disabled={
                        applyingId === action.id
                      }
                      className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                    >
                      {applyingId === action.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Appliquer"
                      )}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
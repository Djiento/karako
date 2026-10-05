
"use client";

import {
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileText,
  Lightbulb,
  Loader2,
  MessageCircle,
  Play,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  applyAIAction,
  applyStructure,
  challengeIdea,
  getAIActions,
  getAIAnalyses,
  getAIChatHistory,
  sendAIMessage,
  structureIdea,
  summarizeIdea,
} from "@/lib/ai";

import type {
  AIAction,
  AIAnalysis,
  AIChatMessage,
  ChallengeResult,
  StructureResult,
  SummaryResult,
} from "@/types/ai";
import AIActionsPanel from "./AIActionsPanel";

interface IdeaAISectionProps {
  ideaId: number;
  onIdeaUpdated?: () => void;
}

type Tab =
  | "structure"
  | "challenge"
  | "summary"
  | "chat"
  | "actions";

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function asString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string",
  );
}

function extractSummary(data: SummaryResult): string {
  if (typeof data.summary === "string") {
    return data.summary;
  }

  if (typeof data.content === "string") {
    return data.content;
  }

  if (typeof data.text === "string") {
    return data.text;
  }

  return "";
}

function getActionLabel(action: AIAction): string {
  return (
    asString(action.title) ||
    asString(action.label) ||
    asString(action.name) ||
    asString(action.action_type) ||
    "Action IA"
  );
}

function getActionDescription(action: AIAction): string {
  return (
    asString(action.description) ||
    asString(action.content) ||
    asString(action.reason) ||
    "Cette action a été proposée par l'IA."
  );
}

export default function IdeaAISection({
  ideaId,
  onIdeaUpdated,
}: IdeaAISectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("structure");

  const [structure, setStructure] =
    useState<StructureResult | null>(null);

  const [challenge, setChallenge] =
    useState<ChallengeResult | null>(null);

  const [summary, setSummary] =
    useState<SummaryResult | null>(null);

  const [analyses, setAnalyses] =
    useState<AIAnalysis[]>([]);

  const [actions, setActions] =
    useState<AIAction[]>([]);

  const [messages, setMessages] =
    useState<AIChatMessage[]>([]);

  const [sessionId, setSessionId] =
    useState<number | undefined>();

  const [chatInput, setChatInput] = useState("");

  const [loading, setLoading] = useState<
    "structure" |
    "challenge" |
    "summary" |
    "chat" |
    "actions" |
    null
  >(null);

  const [applyingStructure, setApplyingStructure] =
    useState(false);

  const [applyingActionId, setApplyingActionId] =
    useState<number | null>(null);

  const [expandedAnalysisId, setExpandedAnalysisId] =
    useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [analysisData, actionData] =
          await Promise.all([
            getAIAnalyses(ideaId),
            getAIActions(ideaId),
          ]);

        if (cancelled) {
          return;
        }

        setAnalyses(analysisData);
        setActions(actionData);
      } catch {
        if (!cancelled) {
          setError(
            "Impossible de charger les données IA.",
          );
        }
      }
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [ideaId]);

  async function handleStructure() {
    setLoading("structure");
    setError(null);

    try {
      const response = await structureIdea(ideaId);

      setStructure(response.result);

      const updatedAnalyses =
        await getAIAnalyses(ideaId);

      setAnalyses(updatedAnalyses);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de structurer l'idée.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function handleApplyStructure() {
    if (!structure) {
      return;
    }

    setApplyingStructure(true);
    setError(null);

    try {
      await applyStructure(ideaId, {
        problem: structure.problem,
        solution: structure.solution,
        target: structure.target,
        next_action: structure.next_action,
      });

      onIdeaUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'appliquer la structure.",
      );
    } finally {
      setApplyingStructure(false);
    }
  }

  async function handleChallenge() {
    setLoading("challenge");
    setError(null);

    try {
      const response = await challengeIdea(ideaId);

      setChallenge(response.result);

      const updatedAnalyses =
        await getAIAnalyses(ideaId);

      setAnalyses(updatedAnalyses);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de challenger l'idée.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function handleSummary() {
    setLoading("summary");
    setError(null);

    try {
      const response = await summarizeIdea(ideaId);

      setSummary(response);

      const updatedAnalyses =
        await getAIAnalyses(ideaId);

      setAnalyses(updatedAnalyses);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de générer le résumé.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function handleSendMessage(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const message = chatInput.trim();

    if (!message || loading === "chat") {
      return;
    }

    setLoading("chat");
    setError(null);

    const optimisticMessage: AIChatMessage = {
      id: Date.now(),
      session: sessionId ?? 0,
      role: "USER",
      content: message,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [
      ...current,
      optimisticMessage,
    ]);

    setChatInput("");

    try {
      const response = await sendAIMessage(
        ideaId,
        message,
        sessionId,
      );

      setSessionId(response.session_id);

      setMessages((current) => [
        ...current,
        response.message,
      ]);

      const history =
        await getAIChatHistory(
          ideaId,
          response.session_id,
        );

      setMessages(history.messages);
    } catch (err) {
      setMessages((current) =>
        current.filter(
          (item) => item.id !== optimisticMessage.id,
        ),
      );

      setChatInput(message);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'envoyer le message.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function handleRefreshActions() {
    setLoading("actions");
    setError(null);

    try {
      const data = await getAIActions(ideaId);
      setActions(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les actions IA.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function handleApplyAction(actionId: number) {
    setApplyingActionId(actionId);
    setError(null);

    try {
      await applyAIAction(ideaId, actionId);

      const updatedActions =
        await getAIActions(ideaId);

      setActions(updatedActions);

      onIdeaUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'appliquer cette action.",
      );
    } finally {
      setApplyingActionId(null);
    }
  }

  function renderStructure() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Structurer l'idée
            </h3>

            <p className="text-sm text-muted-foreground">
              L'IA transforme l'idée actuelle en une structure
              exploitable.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleStructure()}
            disabled={loading === "structure"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "structure" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}

            Structurer
          </button>
        </div>

        {structure ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard
                icon={<ShieldAlert className="h-4 w-4" />}
                title="Problème"
                content={structure.problem}
              />

              <InfoCard
                icon={<Lightbulb className="h-4 w-4" />}
                title="Solution"
                content={structure.solution}
              />

              <InfoCard
                icon={<Target className="h-4 w-4" />}
                title="Cible"
                content={structure.target}
              />
            </div>

            <ListCard
              title="Hypothèses"
              items={structure.hypotheses}
            />

            <ListCard
              title="Questions ouvertes"
              items={structure.open_questions}
            />

            <InfoCard
              icon={<Zap className="h-4 w-4" />}
              title="Prochaine action"
              content={structure.next_action}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleApplyStructure()}
                disabled={applyingStructure}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
              >
                {applyingStructure ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}

                Appliquer à l'idée
              </button>
            </div>
          </>
        ) : (
          <EmptyAIState
            icon={<Sparkles className="h-8 w-8" />}
            title="Aucune structure générée"
            description="Lance une analyse pour clarifier le problème, la solution, la cible et la prochaine action."
          />
        )}
      </div>
    );
  }

  function renderChallenge() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Challenger l'idée
            </h3>

            <p className="text-sm text-muted-foreground">
              Identifie ce qui doit encore être vérifié avant
              d'aller plus loin.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleChallenge()}
            disabled={loading === "challenge"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading === "challenge" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}

            Challenger
          </button>
        </div>

        {challenge ? (
          <>
            <ListCard
              title="Hypothèses à vérifier"
              items={challenge.hypotheses}
            />

            <ListCard
              title="Risques"
              items={challenge.risks}
            />

            <ListCard
              title="Questions critiques"
              items={challenge.critical_questions}
            />

            <ListCard
              title="Informations manquantes"
              items={challenge.missing_information}
            />

            <InfoCard
              icon={<Zap className="h-4 w-4" />}
              title="Prochaine action"
              content={challenge.next_action}
            />
          </>
        ) : (
          <EmptyAIState
            icon={<ShieldAlert className="h-8 w-8" />}
            title="Aucun challenge généré"
            description="Lance le challenger pour identifier les points qui méritent d'être vérifiés."
          />
        )}
      </div>
    );
  }

  function renderSummary() {
    const summaryText = summary
      ? extractSummary(summary)
      : "";

    const keyPoints = summary
      ? asStringArray(summary.key_points)
      : [];

    const nextAction = summary
      ? asString(summary.next_action)
      : "";

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Résumé IA
            </h3>

            <p className="text-sm text-muted-foreground">
              Une synthèse du contexte connu de cette idée.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleSummary()}
            disabled={loading === "summary"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading === "summary" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}

            Générer le résumé
          </button>
        </div>

        {summary ? (
          <div className="space-y-4">
            {summaryText && (
              <InfoCard
                icon={<FileText className="h-4 w-4" />}
                title="Synthèse"
                content={summaryText}
              />
            )}

            {keyPoints.length > 0 && (
              <ListCard
                title="Points clés"
                items={keyPoints}
              />
            )}

            {nextAction && (
              <InfoCard
                icon={<Zap className="h-4 w-4" />}
                title="Prochaine action"
                content={nextAction}
              />
            )}

            {!summaryText &&
              keyPoints.length === 0 &&
              !nextAction && (
                <pre className="overflow-auto rounded-xl border bg-muted/30 p-4 text-sm">
                  {JSON.stringify(summary, null, 2)}
                </pre>
              )}
          </div>
        ) : (
          <EmptyAIState
            icon={<FileText className="h-8 w-8" />}
            title="Aucun résumé"
            description="Génère une synthèse à partir du contexte complet de l'idée."
          />
        )}
      </div>
    );
  }

  function renderChat() {
    return (
      <div className="flex min-h-[520px] flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            Chat IA
          </h3>

          <p className="text-sm text-muted-foreground">
            Discute avec l'IA en conservant le contexte de cette
            idée.
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border bg-muted/20 p-4">
          {messages.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <EmptyAIState
                icon={<MessageCircle className="h-8 w-8" />}
                title="Commence la conversation"
                description="Pose une question sur l'idée, son marché, ses hypothèses ou sa prochaine étape."
              />
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "USER"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === "USER"
                      ? "bg-primary text-primary-foreground"
                      : "border bg-background"
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    {message.content}
                  </p>

                  <p
                    className={`mt-2 text-[10px] ${
                      message.role === "USER"
                        ? "opacity-70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatDate(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="mt-4 flex gap-2"
        >
          <input
            value={chatInput}
            onChange={(event) =>
              setChatInput(event.target.value)
            }
            placeholder="Pose une question à l'IA..."
            disabled={loading === "chat"}
            className="min-w-0 flex-1 rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={
              loading === "chat" ||
              !chatInput.trim()
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "chat" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}

            <span className="hidden sm:inline">
              Envoyer
            </span>
          </button>
        </form>
      </div>
    );
  }

  function renderActions() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Actions IA
            </h3>

            <p className="text-sm text-muted-foreground">
              Actions concrètes proposées à partir du contexte
              de l'idée.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleRefreshActions()}
            disabled={loading === "actions"}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
          >
            {loading === "actions" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            Actualiser
          </button>
        </div>

        {actions.length === 0 ? (
          <EmptyAIState
            icon={<Zap className="h-8 w-8" />}
            title="Aucune action disponible"
            description="Les actions IA apparaîtront ici lorsqu'elles seront disponibles."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {actions.map((action) => {
              const isApplying =
                applyingActionId === action.id;

              return (
                <div
                  key={action.id}
                  className="rounded-xl border bg-background p-5"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Zap className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium">
                        {getActionLabel(action)}
                      </h4>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {getActionDescription(action)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void handleApplyAction(action.id)
                    }
                    disabled={isApplying}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                  >
                    {isApplying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}

                    Appliquer
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderAnalyses() {
    if (analyses.length === 0) {
      return null;
    }

    return (
      <div className="mt-8 border-t pt-8">
        <div className="mb-4">
          <h3 className="font-semibold">
            Historique des analyses IA
          </h3>

          <p className="text-sm text-muted-foreground">
            Les analyses précédemment générées pour cette idée.
          </p>
        </div>

        <div className="space-y-2">
          {analyses.map((analysis) => {
            const expanded =
              expandedAnalysisId === analysis.id;

            return (
              <div
                key={analysis.id}
                className="overflow-hidden rounded-xl border"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedAnalysisId(
                      expanded ? null : analysis.id,
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">
                      {analysis.analysis_type}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {analysis.provider} ·{" "}
                      {formatDate(analysis.created_at)}
                    </p>
                  </div>

                  {expanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  )}
                </button>

                {expanded && (
                  <div className="border-t bg-muted/20 p-4">
                    <pre className="overflow-auto whitespace-pre-wrap text-xs">
                      {JSON.stringify(
                        analysis.result,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const tabs: {
    id: Tab;
    label: string;
    icon: typeof Sparkles;
  }[] = [
    {
      id: "structure",
      label: "Structurer",
      icon: Sparkles,
    },
    {
      id: "challenge",
      label: "Challenger",
      icon: ShieldAlert,
    },
    {
      id: "summary",
      label: "Résumé",
      icon: FileText,
    },
    {
      id: "chat",
      label: "Chat IA",
      icon: MessageCircle,
    },
    {
      id: "actions",
      label: "Actions IA",
      icon: Zap,
    },
  ];

  return (
    <section className="mt-8 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Bot className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Intelligence artificielle
          </h2>

          <p className="text-sm text-muted-foreground">
            Comprendre, challenger et faire avancer cette idée.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max gap-1 rounded-xl border bg-muted/30 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "structure" && renderStructure()}
      {activeTab === "challenge" && renderChallenge()}
      {activeTab === "summary" && renderSummary()}
      {activeTab === "chat" && renderChat()}
      {activeTab === "actions" && renderActions()}

      {renderAnalyses()}
    </section>
  );
}

function InfoCard({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <span className="text-primary">{icon}</span>
        {title}
      </div>

      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {content || "Non défini."}
      </p>
    </div>
  );
}

function ListCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <h4 className="mb-3 text-sm font-medium">
        {title}
      </h4>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun élément identifié.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex gap-3 text-sm leading-6 text-muted-foreground"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyAIState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
      <div className="mb-3 text-muted-foreground">
        {icon}
      </div>

      <h4 className="font-medium">
        {title}
      </h4>

      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
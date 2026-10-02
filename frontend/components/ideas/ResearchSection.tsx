"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Loader2,
  Plus,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";

import {
  createResearchItem,
  deleteResearchItem,
  getResearchItems,
} from "@/lib/research";

import type {
  ResearchItem,
  ResearchType,
} from "@/types/research";

interface ResearchSectionProps {
  ideaId: number;
}

interface ResearchFormState {
  title: string;
  research_type: ResearchType;
  url: string;
  content: string;
  notes: string;
  source: string;
}

const INITIAL_FORM: ResearchFormState = {
  title: "",
  research_type: "NOTE",
  url: "",
  content: "",
  notes: "",
  source: "",
};

const RESEARCH_TYPES: {
  value: ResearchType;
  label: string;
}[] = [
  {
    value: "NOTE",
    label: "Note",
  },
  {
    value: "URL",
    label: "Lien web",
  },
  {
    value: "ARTICLE",
    label: "Article",
  },
  {
    value: "VIDEO",
    label: "Vidéo",
  },
  {
    value: "DOCUMENT",
    label: "Document",
  },
  {
    value: "INTERVIEW",
    label: "Interview",
  },
  {
    value: "OTHER",
    label: "Autre",
  },
];

function getTypeLabel(
  type: ResearchType,
): string {
  return (
    RESEARCH_TYPES.find(
      (item) => item.value === type,
    )?.label ?? type
  );
}

function getTypeIcon(type: ResearchType) {
  switch (type) {
    case "URL":
      return Globe;

    case "VIDEO":
      return Video;

    case "ARTICLE":
    case "DOCUMENT":
    case "INTERVIEW":
      return FileText;

    default:
      return Search;
  }
}

function formatDate(date: string): string {
  try {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ).format(new Date(date));
  } catch {
    return date;
  }
}

export default function ResearchSection({
  ideaId,
}: ResearchSectionProps) {
  const [items, setItems] =
    useState<ResearchItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<ResearchFormState>(
      INITIAL_FORM,
    );

  const loadResearch = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getResearchItems(ideaId);

        setItems(data);
      } catch (err) {
        console.error(
          "Erreur chargement recherche:",
          err,
        );

        setError(
          "Impossible de charger les recherches.",
        );
      } finally {
        setLoading(false);
      }
    },
    [ideaId],
  );

  useEffect(() => {
    void loadResearch();
  }, [loadResearch]);

  function updateField<
    K extends keyof ResearchFormState,
  >(
    field: K,
    value: ResearchFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError(
        "Le titre de la recherche est obligatoire.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await createResearchItem({
        idea: ideaId,
        title: form.title.trim(),
        research_type: form.research_type,
        url: form.url.trim(),
        content: form.content.trim(),
        notes: form.notes.trim(),
        source: form.source.trim(),
      });

      setForm(INITIAL_FORM);
      setShowForm(false);

      await loadResearch();
    } catch (err) {
      console.error(
        "Erreur création recherche:",
        err,
      );

      setError(
        "Impossible d'ajouter cette recherche.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(
    id: number,
  ) {
    const confirmed = window.confirm(
      "Supprimer cette recherche ?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);

      await deleteResearchItem(id);

      setItems((current) =>
        current.filter(
          (item) => item.id !== id,
        ),
      );
    } catch (err) {
      console.error(
        "Erreur suppression recherche:",
        err,
      );

      setError(
        "Impossible de supprimer cette recherche.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />

            <h2 className="text-lg font-semibold">
              Recherche
            </h2>

            {items.length > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {items.length}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Sources, notes et informations utiles
            pour faire avancer cette idée.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setError(null);
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" />
              Fermer
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Ajouter une recherche
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border-b bg-muted/20 p-5"
        >
          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="research-title"
                  className="text-sm font-medium"
                >
                  Titre
                </label>

                <input
                  id="research-title"
                  value={form.title}
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value,
                    )
                  }
                  placeholder="Ex. Étude du marché immobilier"
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                  disabled={submitting}
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="research-type"
                  className="text-sm font-medium"
                >
                  Type
                </label>

                <select
                  id="research-type"
                  value={form.research_type}
                  onChange={(event) =>
                    updateField(
                      "research_type",
                      event.target
                        .value as ResearchType,
                    )
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                  disabled={submitting}
                >
                  {RESEARCH_TYPES.map(
                    (type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="research-source"
                  className="text-sm font-medium"
                >
                  Source
                </label>

                <input
                  id="research-source"
                  value={form.source}
                  onChange={(event) =>
                    updateField(
                      "source",
                      event.target.value,
                    )
                  }
                  placeholder="Ex. LinkedIn, Google, entretien..."
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                  disabled={submitting}
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="research-url"
                  className="text-sm font-medium"
                >
                  URL
                </label>

                <input
                  id="research-url"
                  type="url"
                  value={form.url}
                  onChange={(event) =>
                    updateField(
                      "url",
                      event.target.value,
                    )
                  }
                  placeholder="https://..."
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="research-content"
                className="text-sm font-medium"
              >
                Contenu
              </label>

              <textarea
                id="research-content"
                value={form.content}
                onChange={(event) =>
                  updateField(
                    "content",
                    event.target.value,
                  )
                }
                placeholder="Ajoute ici les informations importantes..."
                rows={5}
                className="resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                disabled={submitting}
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="research-notes"
                className="text-sm font-medium"
              >
                Notes personnelles
              </label>

              <textarea
                id="research-notes"
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value,
                  )
                }
                placeholder="Ce que tu retiens, tes questions, tes idées..."
                rows={4}
                className="resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
                disabled={submitting}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(INITIAL_FORM);
                  setError(null);
                }}
                className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
                disabled={submitting}
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {submitting
                  ? "Enregistrement..."
                  : "Ajouter"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <Search className="mx-auto h-8 w-8 text-muted-foreground" />

            <h3 className="mt-3 text-sm font-semibold">
              Aucune recherche
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Ajoute des sources, articles, vidéos,
              notes ou documents pour enrichir le
              contexte de cette idée.
            </p>

            {!showForm && (
              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
                Ajouter la première recherche
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const Icon = getTypeIcon(
                item.research_type,
              );

              return (
                <article
                  key={item.id}
                  className="group rounded-xl border p-4 transition hover:bg-muted/30"
                >
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">
                              {item.title}
                            </h3>

                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {getTypeLabel(
                                item.research_type,
                              )}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {item.source && (
                              <span>
                                {item.source}
                              </span>
                            )}

                            {item.source &&
                              item.created_at && (
                                <span>
                                  •
                                </span>
                              )}

                            <span>
                              {formatDate(
                                item.created_at,
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            void handleDelete(
                              item.id,
                            )
                          }
                          disabled={
                            deletingId ===
                            item.id
                          }
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-100 transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label="Supprimer la recherche"
                        >
                          {deletingId ===
                          item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {item.content && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {item.content}
                        </p>
                      )}

                      {item.notes && (
                        <div className="mt-3 rounded-lg bg-muted/50 p-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Notes
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                            {item.notes}
                          </p>
                        </div>
                      )}

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex max-w-full items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          <Link2 className="h-4 w-4 shrink-0" />

                          <span className="truncate">
                            {item.url}
                          </span>

                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
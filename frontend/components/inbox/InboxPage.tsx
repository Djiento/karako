"use client";

import {
  Archive,
  ArrowDownAZ,
  ArrowUpAZ,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  Inbox,
  Link2,
  Loader2,
  MoreHorizontal,
  Search,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

import {
  createCapture,
  dismissCapture,
  getCaptures,
  processCapture,
} from "@/lib/ideas";

import type { Capture } from "@/types/idea";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AnimatedContainer } from "@/components/shared/AnimatedContainer";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";

interface InboxPageProps {
  initialCaptures?: Capture[];
}

type FilterValue =
  | "ALL"
  | "TEXT"
  | "VOICE"
  | "IMPORT";

type SortValue =
  | "NEWEST"
  | "OLDEST"
  | "ALPHA";

export default function InboxPage({
  initialCaptures,
}: InboxPageProps) {
  const [captures, setCaptures] = useState<Capture[]>(
    initialCaptures ?? [],
  );

  const [loading, setLoading] = useState(
    initialCaptures === undefined,
  );

  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<FilterValue>("ALL");

  const [sort, setSort] =
    useState<SortValue>("NEWEST");

  const [selectedCapture, setSelectedCapture] =
    useState<Capture | null>(null);

  const [captureToDismiss, setCaptureToDismiss] =
    useState<Capture | null>(null);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [dismissingId, setDismissingId] =
    useState<number | null>(null);

  const [showCaptureDialog, setShowCaptureDialog] =
    useState(false);

  const [newCapture, setNewCapture] = useState("");

  const loadCaptures = async () => {
    try {
      setLoading(true);
      setError(false);

      const data = await getCaptures();

      setCaptures(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    if (initialCaptures === undefined) {
      void loadCaptures();
    }
  });

  const inboxCaptures = useMemo(
    () =>
      captures.filter(
        (capture) => capture.status === "INBOX",
      ),
    [captures],
  );

  const filteredCaptures = useMemo(() => {
    let result = [...inboxCaptures];

    const normalizedSearch =
      search.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((capture) => {
        const text = [
          capture.content,
          capture.context,
          capture.source,
          capture.capture_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(normalizedSearch);
      });
    }

    if (filter !== "ALL") {
      result = result.filter(
        (capture) =>
          capture.capture_type === filter,
      );
    }

    result.sort((a, b) => {
      if (sort === "ALPHA") {
        return a.content.localeCompare(
          b.content,
          "fr",
        );
      }

      const first = new Date(
        a.captured_at,
      ).getTime();

      const second = new Date(
        b.captured_at,
      ).getTime();

      return sort === "NEWEST"
        ? second - first
        : first - second;
    });

    return result;
  }, [
    captures,
    search,
    filter,
    sort,
    inboxCaptures,
  ]);

  const handleProcess = async (
    capture: Capture,
  ) => {
    try {
      setProcessingId(capture.id);

      const response =
        await processCapture(capture.id);

      setCaptures((current) =>
        current.map((item) =>
          item.id === capture.id
            ? {
                ...item,
                status: "PROCESSED",
              }
            : item,
        ),
      );

      setSelectedCapture(null);

      toast.success("Capture transformée en idée");

      void response;
    } catch {
      toast.error(
        "Impossible de traiter cette capture.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (
    capture: Capture,
  ) => {
    try {
      setDismissingId(capture.id);

      await dismissCapture(capture.id);

      setCaptures((current) =>
        current.map((item) =>
          item.id === capture.id
            ? {
                ...item,
                status: "DISMISSED",
              }
            : item,
        ),
      );

      setCaptureToDismiss(null);

      toast.success("Capture ignorée");
    } catch {
      toast.error(
        "Impossible d'ignorer cette capture.",
      );
    } finally {
      setDismissingId(null);
    }
  };

  const handleCreateCapture = async () => {
    const content = newCapture.trim();

    if (!content) {
      toast.error(
        "Écrivez quelque chose avant de capturer.",
      );
      return;
    }

    try {
      const capture = await createCapture({
        content,
        capture_type: "TEXT",
      });

      setCaptures((current) => [
        capture,
        ...current,
      ]);

      setNewCapture("");
      setShowCaptureDialog(false);

      toast.success("Capture ajoutée à l'Inbox");
    } catch {
      toast.error(
        "Impossible de créer la capture.",
      );
    }
  };

  if (loading) {
    return (
      <LoadingState label="Chargement de l'Inbox..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Impossible de charger l'Inbox"
        description="Vérifiez votre connexion puis réessayez."
        action={
          <button
            type="button"
            onClick={loadCaptures}
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Réessayer
          </button>
        }
      />
    );
  }

  return (
    <>
      <div className="min-h-full bg-background">
        <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <AnimatedContainer>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                    <Inbox className="size-4 text-primary" />
                  </div>

                  <Badge variant="secondary">
                    {inboxCaptures.length} en attente
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold tracking-tight">
                  Inbox
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Capturez maintenant. Clarifiez plus tard.
                  Rien ne doit se perdre.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCaptureDialog(true)
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Sparkles className="size-4" />
                Nouvelle capture
              </button>
            </div>
          </AnimatedContainer>

          {/* Toolbar */}
          <AnimatedContainer delay={0.05}>
            <Card>
              <CardContent className="p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder="Rechercher dans vos captures..."
                      className="h-10 w-full rounded-lg border bg-background pl-9 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  {/* Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="hidden size-4 text-muted-foreground sm:block" />

                    <select
                      value={filter}
                      onChange={(event) =>
                        setFilter(
                          event.target
                            .value as FilterValue,
                        )
                      }
                      className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="ALL">
                        Tous les types
                      </option>
                      <option value="TEXT">
                        Texte
                      </option>
                      <option value="VOICE">
                        Vocal
                      </option>
                      <option value="IMPORT">
                        Import
                      </option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    {sort === "ALPHA" ? (
                      <ArrowDownAZ className="size-4 text-muted-foreground" />
                    ) : sort === "NEWEST" ? (
                      <ArrowUpAZ className="size-4 text-muted-foreground" />
                    ) : (
                      <Clock3 className="size-4 text-muted-foreground" />
                    )}

                    <select
                      value={sort}
                      onChange={(event) =>
                        setSort(
                          event.target
                            .value as SortValue,
                        )
                      }
                      className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="NEWEST">
                        Plus récentes
                      </option>
                      <option value="OLDEST">
                        Plus anciennes
                      </option>
                      <option value="ALPHA">
                        Alphabétique
                      </option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>

          {/* Result count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredCaptures.length} capture
              {filteredCaptures.length !== 1
                ? "s"
                : ""}
            </p>

            {(search || filter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("ALL");
                }}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* Captures */}
          {filteredCaptures.length === 0 ? (
            <AnimatedContainer delay={0.1}>
              <EmptyState
                icon={Inbox}
                title={
                  inboxCaptures.length === 0
                    ? "Votre Inbox est vide"
                    : "Aucun résultat"
                }
                description={
                  inboxCaptures.length === 0
                    ? "Vos nouvelles pensées et idées apparaîtront ici."
                    : "Aucune capture ne correspond aux filtres actuels."
                }
                action={
                  inboxCaptures.length === 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setShowCaptureDialog(
                          true,
                        )
                      }
                      className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Sparkles className="size-4" />
                      Faire une capture
                    </button>
                  ) : undefined
                }
              />
            </AnimatedContainer>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCaptures.map(
                (capture, index) => (
                  <AnimatedContainer
                    key={capture.id}
                    delay={0.05 + index * 0.025}
                  >
                    <CaptureCard
                      capture={capture}
                      processing={
                        processingId ===
                        capture.id
                      }
                      dismissing={
                        dismissingId ===
                        capture.id
                      }
                      onOpen={() =>
                        setSelectedCapture(
                          capture,
                        )
                      }
                      onProcess={() =>
                        handleProcess(
                          capture,
                        )
                      }
                      onDismiss={() =>
                        setCaptureToDismiss(
                          capture,
                        )
                      }
                    />
                  </AnimatedContainer>
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={selectedCapture !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCapture(null);
          }
        }}
      >
        <DialogContent>
          {selectedCapture && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Capture
                </DialogTitle>

                <DialogDescription>
                  Consultez le contexte complet avant
                  de transformer cette capture en idée.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 space-y-5">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {selectedCapture.content}
                  </p>
                </div>

                {selectedCapture.context && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Contexte
                    </p>

                    <p className="whitespace-pre-wrap text-sm">
                      {selectedCapture.context}
                    </p>
                  </div>
                )}

                {selectedCapture.source && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Source
                    </p>

                    <p className="text-sm">
                      {selectedCapture.source}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCapture(null);
                    setCaptureToDismiss(
                      selectedCapture,
                    );
                  }}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted"
                >
                  <Archive className="size-4" />
                  Ignorer
                </button>

                <button
                  type="button"
                  disabled={
                    processingId ===
                    selectedCapture.id
                  }
                  onClick={() =>
                    handleProcess(
                      selectedCapture,
                    )
                  }
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                >
                  {processingId ===
                  selectedCapture.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Transformer en idée
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dismiss confirmation */}
      <AlertDialog
        open={captureToDismiss !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCaptureToDismiss(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Ignorer cette capture ?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Cette capture ne sera plus affichée dans
              votre Inbox. Vous pourrez toujours la
              retrouver dans vos captures traitées.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Annuler
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={
                captureToDismiss
                  ? dismissingId ===
                    captureToDismiss.id
                  : false
              }
              onClick={() => {
                if (captureToDismiss) {
                  void handleDismiss(
                    captureToDismiss,
                  );
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {captureToDismiss &&
              dismissingId ===
                captureToDismiss.id ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Ignorer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New capture */}
      <Dialog
        open={showCaptureDialog}
        onOpenChange={setShowCaptureDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Nouvelle capture
            </DialogTitle>

            <DialogDescription>
              Écrivez rapidement votre pensée. Karako
              vous permettra de la structurer ensuite.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5">
            <textarea
              value={newCapture}
              onChange={(event) =>
                setNewCapture(
                  event.target.value,
                )
              }
              autoFocus
              rows={6}
              placeholder="Une idée, une question, une observation..."
              className="w-full resize-none rounded-lg border bg-background p-3 text-sm leading-6 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <DialogFooter className="mt-5">
            <button
              type="button"
              onClick={() =>
                setShowCaptureDialog(false)
              }
              className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={() =>
                void handleCreateCapture()
              }
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="size-4" />
              Capturer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface CaptureCardProps {
  capture: Capture;
  processing: boolean;
  dismissing: boolean;
  onOpen: () => void;
  onProcess: () => void;
  onDismiss: () => void;
}

function CaptureCard({
  capture,
  processing,
  dismissing,
  onOpen,
  onProcess,
  onDismiss,
}: CaptureCardProps) {
  const icon =
    capture.capture_type === "VOICE"
      ? Video
      : capture.capture_type === "IMPORT"
        ? Link2
        : FileText;

  const Icon = icon;

  return (
    <Card className="group h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <CardContent className="flex h-full flex-col p-5">

        <div className="flex items-start justify-between gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-4 text-primary" />
          </div>

          <button
            type="button"
            onClick={onOpen}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Ouvrir"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>

        <div
          className="mt-4 flex-1 cursor-pointer"
          onClick={onOpen}
        >
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary">
              {capture.capture_type === "TEXT"
                ? "Texte"
                : capture.capture_type ===
                    "VOICE"
                  ? "Vocal"
                  : "Import"}
            </Badge>

            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(
                new Date(
                  capture.captured_at,
                ),
                {
                  addSuffix: true,
                  locale: fr,
                },
              )}
            </span>
          </div>

          <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6">
            {capture.content}
          </p>

          {capture.context && (
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {capture.context}
            </p>
          )}

          {capture.source && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link2 className="size-3.5" />
              <span className="truncate">
                {capture.source}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 border-t pt-4">
          <button
            type="button"
            disabled={
              processing || dismissing
            }
            onClick={onProcess}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}

            Transformer
          </button>

          <button
            type="button"
            disabled={
              processing || dismissing
            }
            onClick={onDismiss}
            className="inline-flex size-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label="Ignorer"
          >
            {dismissing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Archive className="size-3.5" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
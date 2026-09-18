"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  Check,
  Inbox as InboxIcon,
  Plus,
  X,
} from "lucide-react";

import { useCaptures } from "@/hooks/use-captures";

export default function InboxPage() {
  const {
    captures,
    loading,
    error,
    addCapture,
    process,
    dismiss,
  } = useCaptures();

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await addCapture({
        content: content.trim(),
        capture_type: "TEXT",
      });

      setContent("");
    } finally {
      setSubmitting(false);
    }
  }

  const inbox = captures.filter(
    (capture) => capture.status === "INBOX",
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Inbox
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Capture rapidement ce qui te passe par la tête.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          rows={4}
          placeholder="Une idée, une question, une observation..."
          className="w-full resize-none border-0 outline-none"
        />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={
              submitting || !content.trim()
            }
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Plus size={17} />

            {submitting
              ? "Capture..."
              : "Capturer"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <InboxIcon size={18} />

          <h2 className="font-semibold">
            À traiter
          </h2>

          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
            {inbox.length}
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Chargement...
          </div>
        ) : inbox.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <InboxIcon
              size={30}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-sm text-slate-500">
              Ton inbox est vide.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inbox.map((capture) => (
              <div
                key={capture.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {capture.content}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {new Date(
                      capture.captured_at,
                    ).toLocaleString("fr-FR")}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        dismiss(capture.id)
                      }
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <X size={14} />
                      Ignorer
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        process(capture.id)
                      }
                      className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                    >
                      <Check size={14} />
                      Traiter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
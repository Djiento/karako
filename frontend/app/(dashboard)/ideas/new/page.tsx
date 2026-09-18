"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createIdea } from "@/lib/ideas";

export default function NewIdeaPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const idea = await createIdea({
        title,
        description,
      });

      router.push(`/ideas/${idea.id}`);
    } catch {
      setError(
        "Impossible de créer l'idée.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/ideas"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Retour aux idées
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Nouvelle idée
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Capture le minimum maintenant. On pourra
            structurer le reste ensuite.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium"
            >
              Titre
            </label>

            <input
              id="title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              required
              placeholder="Ex : Application de gestion..."
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={7}
              placeholder="Décris rapidement ton idée..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href="/ideas"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loading
                ? "Création..."
                : "Créer l'idée"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
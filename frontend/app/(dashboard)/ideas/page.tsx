"use client";

import Link from "next/link";
import {
  ArrowRight,
  Lightbulb,
  Plus,
} from "lucide-react";

import { useIdeas } from "@/hooks/use-ideas";

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

export default function IdeasPage() {
  const {
    ideas,
    loading,
    error,
  } = useIdeas();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Mes idées
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Toutes tes idées au même endroit.
          </p>
        </div>

        <Link
          href="/ideas/new"
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={17} />
          Nouvelle idée
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Chargement des idées...
        </div>
      ) : ideas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Lightbulb
            size={32}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 font-semibold">
            Aucune idée pour le moment
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Capture ta première idée et commence à la
            développer.
          </p>

          <Link
            href="/ideas/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            <Plus size={17} />
            Créer une idée
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea) => (
            <Link
              key={idea.id}
              href={`/ideas/${idea.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Lightbulb size={19} />
                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700"
                />
              </div>

              <h2 className="mt-5 line-clamp-2 font-semibold">
                {idea.title}
              </h2>

              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                {idea.description ||
                  "Aucune description pour le moment."}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {statusLabels[idea.status] ??
                    idea.status}
                </span>

                {idea.score !== null && (
                  <span className="text-xs font-medium text-slate-500">
                    Score {idea.score}/100
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
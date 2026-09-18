"use client";

import Link from "next/link";
import {
  ArrowRight,
  FolderKanban,
  Inbox,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import { useIdeas } from "@/hooks/use-ideas";
import { useCaptures } from "@/hooks/use-captures";

export default function DashboardPage() {
  const {
    ideas,
    loading: ideasLoading,
  } = useIdeas();

  const {
    captures,
    loading: capturesLoading,
  } = useCaptures();

  const inboxCount = captures.filter(
    (capture) => capture.status === "INBOX",
  ).length;

  const activeIdeas = ideas.filter(
    (idea) => idea.status !== "ARCHIVED",
  ).length;

  const stats = [
    {
      label: "Idées",
      value: activeIdeas,
      description: "Idées actives",
      href: "/ideas",
      icon: Lightbulb,
    },
    {
      label: "Inbox",
      value: inboxCount,
      description: "Captures à traiter",
      href: "/inbox",
      icon: Inbox,
    },
    {
      label: "Projets",
      value: 0,
      description: "Projets actifs",
      href: "/projects",
      icon: FolderKanban,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={20} />

          <span className="text-sm font-medium text-slate-500">
            Karako
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Ton deuxième cerveau.
        </h1>

        <p className="mt-2 max-w-2xl text-slate-500">
          Capture tes idées, comprends-les, explore-les,
          valide-les et transforme les meilleures en projets.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Icon size={20} />
                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700"
                />
              </div>

              <p className="mt-5 text-sm text-slate-500">
                {stat.label}
              </p>

              <p className="mt-1 text-3xl font-bold">
                {ideasLoading ||
                capturesLoading
                  ? "..."
                  : stat.value}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {stat.description}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-8">
        <div className="max-w-xl">
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
            Capture
          </span>

          <h2 className="mt-4 text-xl font-semibold">
            Une idée vient de te traverser l'esprit ?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ne la laisse pas disparaître. Capture-la maintenant.
            Karako pourra ensuite t'aider à la structurer.
          </p>

          <Link
            href="/ideas/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Lightbulb size={17} />
            Capturer une idée
          </Link>
        </div>
      </section>
    </div>
  );
}
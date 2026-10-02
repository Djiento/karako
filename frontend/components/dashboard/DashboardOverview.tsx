"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Inbox,
  Lightbulb,
  Plus,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getCaptures,
  getIdeas,
} from "@/lib/ideas";

import type {
  Capture,
  Idea,
} from "@/types/idea";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { AnimatedContainer } from "@/components/shared/AnimatedContainer";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface DashboardStats {
  ideas: number;
  inbox: number;
  exploring: number;
  building: number;
}

export default function DashboardOverview() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(false);

        const [
          ideasData,
          capturesData,
        ] = await Promise.all([
          getIdeas(),
          getCaptures(),
        ]);

        if (cancelled) {
          return;
        }

        setIdeas(ideasData);
        setCaptures(capturesData);
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingState label="Préparation de votre espace..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Impossible de charger le dashboard"
        description="Vérifiez votre connexion puis rechargez la page."
      />
    );
  }

  const stats: DashboardStats = {
    ideas: ideas.length,

    inbox: captures.filter(
      (capture) => capture.status === "INBOX",
    ).length,

    exploring: ideas.filter(
      (idea) =>
        idea.status === "EXPLORING" ||
        idea.status === "RESEARCHING" ||
        idea.status === "VALIDATING",
    ).length,

    building: ideas.filter(
      (idea) => idea.status === "BUILDING",
    ).length,
  };

  const recentIdeas = ideas.slice(0, 5);

  const recentCaptures = captures
    .filter((capture) => capture.status === "INBOX")
    .slice(0, 4);

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <AnimatedContainer>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="size-4 text-primary" />
                </div>

                <Badge
                  variant="secondary"
                  className="rounded-full"
                >
                  Idea Operating System
                </Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Bonjour 👋
              </h1>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                Votre espace central pour capturer,
                comprendre et faire évoluer vos idées.
              </p>
            </div>

            <Link
              href="/ideas/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Nouvelle idée
            </Link>
          </div>
        </AnimatedContainer>

        {/* Stats */}
        <AnimatedContainer delay={0.05}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Idées"
              value={stats.ideas}
              description="Toutes vos idées"
              icon={Lightbulb}
              href="/ideas"
            />

            <StatCard
              title="Inbox"
              value={stats.inbox}
              description="Captures à traiter"
              icon={Inbox}
              href="/inbox"
              highlight={stats.inbox > 0}
            />

            <StatCard
              title="En exploration"
              value={stats.exploring}
              description="Idées en réflexion"
              icon={Sparkles}
              href="/ideas"
            />

            <StatCard
              title="En construction"
              value={stats.building}
              description="Projets en cours"
              icon={CheckCircle2}
              href="/projects"
            />

          </div>
        </AnimatedContainer>

        {/* Main grid */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">

          {/* Ideas */}
          <AnimatedContainer delay={0.1}>
            <Card className="h-full overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Idées récentes</CardTitle>
                  <CardDescription>
                    Les dernières idées que vous avez travaillées.
                  </CardDescription>
                </div>

                <Link
                  href="/ideas"
                  className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Voir tout
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </CardHeader>

              <CardContent>
                {recentIdeas.length === 0 ? (
                  <EmptyState
                    icon={Lightbulb}
                    title="Aucune idée pour le moment"
                    description="Commencez par capturer votre première idée."
                    action={
                      <Link
                        href="/ideas/new"
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="size-4" />
                        Créer une idée
                      </Link>
                    }
                  />
                ) : (
                  <div className="divide-y">
                    {recentIdeas.map((idea) => (
                      <Link
                        key={idea.id}
                        href={`/ideas/${idea.id}`}
                        className="group flex items-center gap-4 py-4 transition-colors first:pt-0 last:pb-0 hover:bg-muted/40"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Lightbulb className="size-4 text-primary" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                              {idea.title}
                            </h3>
                          </div>

                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {idea.description ||
                              "Aucune description"}
                          </p>
                        </div>

                        <StatusBadge status={idea.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>

          {/* Inbox */}
          <AnimatedContainer delay={0.15}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Inbox</CardTitle>
                  <CardDescription>
                    Vos captures en attente.
                  </CardDescription>
                </div>

                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Inbox className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>

              <CardContent>
                {recentCaptures.length === 0 ? (
                  <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-6 text-center">
                    <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-muted">
                      <CheckCircle2 className="size-5 text-muted-foreground" />
                    </div>

                    <p className="text-sm font-medium">
                      Inbox vide
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Toutes vos captures sont traitées.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentCaptures.map((capture) => (
                      <Link
                        key={capture.id}
                        href="/inbox"
                        className="block rounded-lg border p-3 transition hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-sm font-medium">
                            {capture.content}
                          </p>

                          <Badge
                            variant="outline"
                            className="shrink-0"
                          >
                            {capture.capture_type}
                          </Badge>
                        </div>

                        {capture.context && (
                          <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                            {capture.context}
                          </p>
                        )}
                      </Link>
                    ))}

                    <Link
                      href="/inbox"
                      className="group flex items-center justify-center gap-2 pt-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Ouvrir l'Inbox
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>

        {/* Quick actions */}
        <AnimatedContainer delay={0.2}>
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Les actions les plus utilisées dans Karako.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <QuickAction
                  href="/ideas/new"
                  icon={Lightbulb}
                  title="Capturer une idée"
                  description="Commencer une nouvelle idée"
                />

                <QuickAction
                  href="/inbox"
                  icon={Inbox}
                  title="Traiter l'Inbox"
                  description="Clarifier vos captures"
                />

                <QuickAction
                  href="/ideas"
                  icon={Sparkles}
                  title="Explorer"
                  description="Continuer une réflexion"
                />

                <QuickAction
                  href="/projects"
                  icon={CheckCircle2}
                  title="Projets"
                  description="Voir les projets actifs"
                />

              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>

      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  href: string;
  highlight?: boolean;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  highlight = false,
}: StatCardProps) {
  return (
    <Link href={href}>
      <Card
        className={`group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
          highlight
            ? "border-primary/30 bg-primary/[0.03]"
            : ""
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {value}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            </div>

            <div
              className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                highlight
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              }`}
            >
              <Icon className="size-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface QuickActionProps {
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
        <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  );
}
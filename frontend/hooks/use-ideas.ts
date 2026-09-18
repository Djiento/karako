"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createIdea,
  getIdeas,
  getIdea,
  updateIdea,
} from "@/lib/ideas";

import type {
  CreateIdeaPayload,
  Idea,
} from "@/types/idea";

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getIdeas();
      setIdeas(data);
    } catch {
      setError("Impossible de charger les idées.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const addIdea = async (
    payload: CreateIdeaPayload,
  ): Promise<Idea> => {
    const idea = await createIdea(payload);

    setIdeas((current) => [idea, ...current]);

    return idea;
  };

  return {
    ideas,
    loading,
    error,
    refresh: fetchIdeas,
    addIdea,
  };
}

export function useIdea(id: number) {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdea = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getIdea(id);
      setIdea(data);
    } catch {
      setError("Impossible de charger cette idée.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIdea();
  }, [fetchIdea]);

  const update = async (
    payload: Partial<CreateIdeaPayload>,
  ) => {
    const updated = await updateIdea(id, payload);
    setIdea(updated);
    return updated;
  };

  return {
    idea,
    loading,
    error,
    refresh: fetchIdea,
    update,
  };
}
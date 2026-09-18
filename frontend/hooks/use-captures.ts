"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createCapture,
  dismissCapture,
  getCaptures,
  processCapture,
} from "@/lib/ideas";

import type {
  Capture,
  CreateCapturePayload,
} from "@/types/idea";

export function useCaptures() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCaptures = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCaptures();
      setCaptures(data);
    } catch {
      setError("Impossible de charger les captures.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaptures();
  }, [fetchCaptures]);

  const addCapture = async (
    payload: CreateCapturePayload,
  ) => {
    const capture = await createCapture(payload);

    setCaptures((current) => [
      capture,
      ...current,
    ]);

    return capture;
  };

  const process = async (id: number) => {
  const result = await processCapture(id);

  setCaptures((current) =>
    current.map((capture) =>
      capture.id === id
        ? result.capture
        : capture,
    ),
  );

  return result;
};

  const dismiss = async (id: number) => {
    const updated = await dismissCapture(id);

    setCaptures((current) =>
      current.map((capture) =>
        capture.id === id ? updated : capture,
      ),
    );

    return updated;
  };

  return {
    captures,
    loading,
    error,
    refresh: fetchCaptures,
    addCapture,
    process,
    dismiss,
  };
}
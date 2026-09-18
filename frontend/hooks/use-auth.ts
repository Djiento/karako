"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getCurrentUser,
  isAuthenticated,
  login,
  logout,
} from "@/lib/auth";

import type { User } from "@/types/auth";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<void> => {
    await login(email, password);

    const currentUser = await getCurrentUser();

    setUser(currentUser);
  };

  const signOut = (): void => {
    logout();
    setUser(null);
    window.location.href = "/login";
  };

  return {
    user,
    loading,
    authenticated: Boolean(user),
    signIn,
    signOut,
  };
}
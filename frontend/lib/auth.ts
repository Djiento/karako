import type {
  LoginResponse,
  RegisterPayload,
  User,
} from "@/types/auth";

import {
  apiGet,
  apiPost,
} from "@/lib/api";

import {
  saveTokens as storeTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from "@/lib/token-storage";

export function saveTokens(
  tokens: LoginResponse,
): void {
  storeTokens(
    tokens.access,
    tokens.refresh,
  );
}

export {
  getAccessToken,
  getRefreshToken,
  clearTokens,
};

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const tokens =
    await apiPost<LoginResponse>(
      "/auth/login/",
      {
        email,
        password,
      },
      {
        auth: false,
      },
    );

  saveTokens(tokens);

  return tokens;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken =
    getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    return null;
  }

  try {
    const tokens =
      await apiPost<LoginResponse>(
        "/auth/refresh/",
        {
          refresh: refreshToken,
        },
        {
          auth: false,
        },
      );

    saveTokens(tokens);

    return tokens.access;
  } catch {
    clearTokens();
    return null;
  }
}

export async function register(
  payload: RegisterPayload,
): Promise<User> {
  return apiPost<User>(
    "/auth/register/",
    payload,
    {
      auth: false,
    },
  );
}

export async function getCurrentUser(): Promise<User> {
  return apiGet<User>(
    "/auth/me/",
  );
}

export function logout(): void {
  clearTokens();

  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "@/lib/token-storage";

import type { LoginResponse } from "@/types/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type RequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(
    status: number,
    data: unknown,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${API_URL}/auth/refresh/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        },
      );

      if (!response.ok) {
        clearTokens();
        return null;
      }

      const tokens =
        await response.json() as LoginResponse;

      saveTokens(tokens.access, tokens.refresh);

      return tokens.access;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    auth = true,
    retry = true,
    ...fetchOptions
  } = options;

  const headers = new Headers(
    fetchOptions.headers,
  );

  headers.set(
    "Content-Type",
    "application/json",
  );

  if (auth) {
    const accessToken = getAccessToken();

    if (accessToken) {
      headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    }
  }

  let response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...fetchOptions,
      headers,
    },
  );

  /*
   * Access token expiré.
   * On tente un refresh une seule fois.
   */
  if (
    response.status === 401 &&
    auth &&
    retry
  ) {
    const newAccessToken =
      await refreshAccessToken();

    if (newAccessToken) {
      const retryHeaders = new Headers(
        fetchOptions.headers,
      );

      retryHeaders.set(
        "Content-Type",
        "application/json",
      );

      retryHeaders.set(
        "Authorization",
        `Bearer ${newAccessToken}`,
      );

      response = await fetch(
        `${API_URL}${endpoint}`,
        {
          ...fetchOptions,
          headers: retryHeaders,
        },
      );
    }
  }

  if (!response.ok) {
    let errorData: unknown;

    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    throw new ApiError(
      response.status,
      errorData,
      response.statusText,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function apiGet<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  return apiFetch<T>(
    endpoint,
    {
      ...options,
      method: "GET",
    },
  );
}

export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  return apiFetch<T>(
    endpoint,
    {
      ...options,
      method: "POST",
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    },
  );
}

export async function apiPatch<T>(
  endpoint: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<T> {
  return apiFetch<T>(
    endpoint,
    {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function apiDelete<T = void>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  return apiFetch<T>(
    endpoint,
    {
      ...options,
      method: "DELETE",
      body: undefined,
    },
  );
}
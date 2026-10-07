/**
 * SSR Server-Side Fetch Utilities (Customer Side)
 *
 * Customer-facing pages use SSR (Server Components). These helpers provide
 * an authenticated fetch that automatically injects the current user's
 * access token from the HttpOnly cookie as a Bearer header.
 *
 * The middleware handles token refresh BEFORE the page renders, so by the
 * time a Server Component runs, the cookie always holds a valid token.
 *
 * Usage:
 *   import { serverFetch } from "@/lib/auth/server-fetch";
 *
 *   // In a Server Component or Route Handler:
 *   const data = await serverFetch("/api/v1/orders");
 */

import { cookies } from "next/headers";
import { APP_CONFIG } from "@/constants/config";

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://13.201.222.82:80";
const API_V1 = `${BACKEND_BASE}/api/v1`;

type FetchConfig = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

/**
 * Authenticated fetch for Server Components and Route Handlers.
 *
 * - Reads the access token from the HttpOnly cookie via `next/headers`
 * - Attaches it as `Authorization: Bearer <token>` on every request
 * - Throws on non-2xx responses with a descriptive error
 *
 * @param endpoint  Path relative to /api/v1 (e.g. "/orders", "/users/me")
 * @param config    Standard RequestInit options + optional query params
 */
export async function serverFetch<T = unknown>(
  endpoint: string,
  config: FetchConfig = {},
): Promise<T> {
  const { params, ...init } = config;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

  // Build URL with optional query params
  const url = new URL(`${API_V1}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body?.error?.message || body?.message || message;
    } catch {
      // Non-JSON error body
    }
    throw new Error(`[serverFetch] ${response.status} ${message} — ${endpoint}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/**
 * Returns the current user's access token from the server-side cookie.
 * Use this when you need the raw token for manual Authorization headers.
 */
export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value ?? null;
}

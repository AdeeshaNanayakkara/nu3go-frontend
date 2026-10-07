/**
 * Server-side fetch wrapper.
 * Used in Server Components, Server Actions, and API route handlers.
 *
 * Reads auth cookies from the incoming request headers and forwards them
 * to the NestJS backend as Authorization bearer tokens.
 */

import { cookies } from "next/headers";
import { APP_CONFIG } from "@/constants/config";
import type { ApiError, ApiResponse } from "@/services/types/api-response";

const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Server-side fetch with automatic auth token forwarding.
 */
export async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit & {
    params?: Record<string, string | number | boolean | undefined>;
  },
): Promise<ApiResponse<T>> {
  const { params, ...init } = options || {};

  // Build URL with query params
  const url = new URL(endpoint, API_INTERNAL_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  // Read auth cookie and forward as bearer token
  const cookieStore = await cookies();
  const token = cookieStore.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init?.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: response.statusText,
      errors: [],
    };

    try {
      const body = await response.json();
      error.message = body.message || response.statusText;
      error.errors = body.errors || [];
    } catch {
      // Response body is not JSON
    }

    throw error;
  }

  if (response.status === 204) {
    return { data: undefined as T, status: 204 };
  }

  const data = await response.json();
  return { data, status: response.status };
}

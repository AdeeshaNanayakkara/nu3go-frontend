/**
 * Client-side API fetch wrapper (CSR — Admin Side).
 *
 * This client is used in Client Components and browser-side code (primarily the Admin panel).
 * The Admin side is fully CSR (no SSR), so all session management happens here.
 *
 * Features:
 *  - Automatic JSON parsing with typed responses
 *  - Credentials included (sends HttpOnly cookies on every request)
 *  - 401 interceptor: automatically refreshes access token and retries the request once
 *  - Refresh deduplication: concurrent 401s share a single refresh promise (no race conditions)
 *  - Forced logout: if refresh also fails, clears auth store and redirects to /login
 *
 * NOTE: For Server Components (customer SSR side), use the server-side fetch
 * utilities in `src/lib/auth/server-fetch.ts` instead.
 */

import type { ApiError, ApiResponse } from "@/services/types/api-response";
import { refreshAccessToken } from "@/lib/auth/token-refresher";

export type RequestConfig = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
  /** Internal flag — prevents infinite retry loops on persistent 401s */
  _retry?: boolean;
  /** Skip auto-refresh and redirect on 401 (useful for public/optional requests) */
  skipAuthRedirect?: boolean;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: RequestConfig["params"]): string {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: response.statusText,
        errors: [],
      };

      try {
        const body = await response.json();
        error.message =
          body?.error?.message || body?.message || response.statusText;
        error.errors = body.errors || [];
      } catch {
        // Response body is not JSON — use statusText
      }

      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: undefined as T, status: 204 };
    }

    const data = await response.json();
    return { data, status: response.status };
  }

  /**
   * Core request method with 401 auto-refresh + retry.
   *
   * Flow on 401:
   *  1. Call refreshAccessToken() (singleton — safe for concurrent calls)
   *  2. If refresh OK  → retry the original request once (_retry = true)
   *  3. If refresh FAIL → logout user + redirect to /login?reason=session_expired (only on protected routes)
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const { params, _retry = false, skipAuthRedirect = false, ...init } = config || {};
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...init,
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // ─── 401 Interceptor ─────────────────────────────────────────────────────
    if (response.status === 401 && !_retry) {
      if (skipAuthRedirect) {
        const error: ApiError = {
          status: 401,
          message: "Unauthorized",
          errors: [],
        };
        throw error;
      }

      const refreshed = await refreshAccessToken();

      if (refreshed) {
        // Retry with _retry=true to prevent infinite loops
        return this.request<T>(method, endpoint, body, {
          ...config,
          _retry: true,
        });
      }

      // Refresh also failed — session is unrecoverable, handle logout safely
      await this.handleSessionExpired();

      // Return a typed error for any awaiting callers
      const error: ApiError = {
        status: 401,
        message: "Session expired. Please sign in again.",
        errors: [],
      };
      throw error;
    }
    // ─────────────────────────────────────────────────────────────────────────

    return this.handleResponse<T>(response);
  }

  /**
   * Clears auth state and redirects to login when appropriate.
   * Protects guest users on public pages from unwanted login redirects.
   */
  private async handleSessionExpired(): Promise<void> {
    if (typeof window === "undefined") return;

    let wasAuthenticated = false;
    try {
      const { useAuthStore } = await import("@/store/auth.store");
      wasAuthenticated = useAuthStore.getState().isAuthenticated;
      await useAuthStore.getState().logout();
    } catch {
      // Fallback: just proceed
    }

    const pathname = window.location.pathname;
    const isPublic =
      pathname === "/" ||
      pathname === "/plans" ||
      pathname.startsWith("/plans/") ||
      pathname === "/services" ||
      pathname.startsWith("/services/") ||
      pathname === "/about" ||
      pathname === "/contact" ||
      pathname === "/faq" ||
      pathname === "/categories" ||
      pathname.startsWith("/categories/") ||
      pathname === "/blog" ||
      pathname.startsWith("/blog/") ||
      pathname === "/search";

    // Only redirect if user was authenticated (session expired) OR is on a protected route
    if (!isPublic || wasAuthenticated) {
      window.location.href = "/login?reason=session_expired";
    }
  }

  // ─── HTTP Method Wrappers ────────────────────────────────────────────────

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, undefined, config);
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, body, config);
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, body, config);
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, body, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint, undefined, config);
  }
}

/**
 * Singleton API client for CSR (Admin side) browser-side use.
 *
 * Base URL is the Next.js BFF — all backend calls go through BFF proxies,
 * keeping raw tokens server-side in HttpOnly cookies.
 */
export const apiClient = new ApiClient(
  typeof window !== "undefined" ? window.location.origin : "",
);

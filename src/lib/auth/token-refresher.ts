/**
 * CSR Token Refresh Singleton
 *
 * Manages automatic access token refresh for client-side (CSR) API calls.
 * Used by the apiClient to silently refresh expired tokens and retry failed requests.
 *
 * KEY DESIGN: Only ONE refresh HTTP call is made at a time.
 * If 3 concurrent requests all fail with 401, they all await the SAME promise
 * instead of triggering 3 separate refresh calls (race condition prevention).
 */

/** Shared in-flight refresh promise — null when no refresh is happening */
let activeRefreshPromise: Promise<boolean> | null = null;

/**
 * Refreshes the access token via the BFF `/api/auth/refresh` route.
 *
 * - Thread-safe: multiple callers share a single in-flight promise
 * - Automatically clears the shared promise when done (success or failure)
 * - Returns `true` if new tokens were set in cookies, `false` otherwise
 *
 * @example
 * // In an API client interceptor:
 * if (response.status === 401 && !isRetry) {
 *   const ok = await refreshAccessToken();
 *   if (ok) return retryRequest();
 * }
 */
export async function refreshAccessToken(): Promise<boolean> {
  // Reuse the in-flight promise if one exists
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include", // Send HttpOnly refresh token cookie
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      // Always clear so the next expiry triggers a fresh call
      activeRefreshPromise = null;
    });

  return activeRefreshPromise;
}

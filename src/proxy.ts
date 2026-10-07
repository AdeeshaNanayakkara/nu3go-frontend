/**
 * Root Next.js proxy middleware.
 *
 * Responsibilities:
 *  1. Route protection (public / auth / user / admin)
 *  2. Role-based access control (RBAC)
 *  3. Proactive token refresh (edge-side, before the request hits any page)
 *
 * ─── Rendering Strategy ──────────────────────────────────────────────────────
 *  • Customer routes (/dashboard, /orders, etc.) → SSR
 *    The proxy MUST refresh tokens proactively so Server Components
 *    always receive a valid access token on every request. The new cookie
 *    is injected into the forwarded request headers so `cookies()` from
 *    `next/headers` sees the refreshed token immediately.
 *
 *  • Admin routes (/admin/*) → CSR
 *    The proxy still refreshes proactively (avoids login flashes), but
 *    the apiClient in `src/services/api/client.ts` acts as a belt-and-
 *    suspenders fallback: if a CSR API call gets a 401, it calls the
 *    singleton refresher and retries the request transparently.
 *
 * ─── Token Refresh Flow ──────────────────────────────────────────────────────
 *  Request arrives
 *    │
 *    ├─ Access token valid?  ──Yes──► Continue
 *    │
 *    ├─ Access token expired AND refresh token present?
 *    │     │
 *    │     ├─ Call backend /api/v1/auth/refresh directly (edge-compatible)
 *    │     │
 *    │     ├─ Refresh OK?
 *    │     │   ├─ Inject new access token into forwarded request cookie header
 *    │     │   ├─ Set new cookies on outgoing response (browser update)
 *    │     │   └─ Continue to page
 *    │     │
 *    │     └─ Refresh FAILED?
 *    │           └─ Redirect to /login?reason=session_expired (clear cookies)
 *    │
 *    └─ No tokens at all?  ──► Redirect to /login?callbackUrl=...
 */

import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import {
  hasValidToken,
  hasRefreshToken,
  getRefreshTokenFromRequest,
  decodeTokenPayload,
} from "@/middleware/auth.middleware";
import { getRouteType, hasRoleAccess } from "@/middleware/rbac.middleware";
import { APP_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";

// ─── Edge-Compatible Token Refresh ─────────────────────────────────────────

interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

/**
 * Calls the backend refresh endpoint directly from the Edge proxy.
 * Returns new token pair on success, null on failure.
 *
 * Uses the backend directly (not the BFF /api/auth/refresh route) because
 * proxy cannot call internal Next.js routes without an absolute URL,
 * and doing so would add an extra network hop on every request.
 */
async function attemptTokenRefresh(
  refreshToken: string,
): Promise<RefreshResult | null> {
  try {
    const res = await fetch(BACKEND_ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.success || !data?.data?.access_token) return null;

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token || refreshToken,
    };
  } catch {
    // Network error or backend unavailable
    return null;
  }
}

/**
 * Builds a NextResponse that:
 *  1. Forwards the request to the page handler with the new access token
 *     injected into the Cookie request header (so SSR `cookies()` sees it).
 *  2. Sets updated cookies on the response (so the browser stores them).
 */
function buildRefreshedResponse(
  request: NextRequest,
  tokens: RefreshResult,
): NextResponse {
  const isProduction = process.env.NODE_ENV === "production";

  // ── Inject new token into the FORWARDED request cookie header ──
  // This ensures Server Components calling `cookies()` get the refreshed token
  // on the CURRENT request (not just future ones).
  const existingCookie = request.headers.get("cookie") || "";

  // Replace old access token value; append if not present
  const accessCookieKey = APP_CONFIG.COOKIES.ACCESS_TOKEN;
  const refreshCookieKey = APP_CONFIG.COOKIES.REFRESH_TOKEN;

  const updatedCookie = existingCookie
    // Remove old access token entry
    .split(";")
    .map((c) => c.trim())
    .filter(
      (c) =>
        !c.startsWith(`${accessCookieKey}=`) &&
        !c.startsWith(`${refreshCookieKey}=`),
    )
    .concat(
      `${accessCookieKey}=${tokens.accessToken}`,
      `${refreshCookieKey}=${tokens.refreshToken}`,
    )
    .join("; ");

  const modifiedHeaders = new Headers(request.headers);
  modifiedHeaders.set("cookie", updatedCookie);

  const response = NextResponse.next({
    request: { headers: modifiedHeaders },
  });

  // ── Set cookies on the OUTGOING response (browser update) ──
  const cookieOpts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };

  response.cookies.set(accessCookieKey, tokens.accessToken, {
    ...cookieOpts,
    maxAge: 60 * 60, // 1 hour
  });

  response.cookies.set(refreshCookieKey, tokens.refreshToken, {
    ...cookieOpts,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

/**
 * Redirects to /login and clears auth cookies.
 * Called when refresh fails — ensures stale cookies don't block future logins.
 */
function buildExpiredSessionRedirect(
  request: NextRequest,
  includeCallback = true,
): NextResponse {
  const isAdminTarget = request.nextUrl.pathname.startsWith("/admin");
  const loginPath = isAdminTarget ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;
  const loginUrl = new URL(loginPath, request.url);
  loginUrl.searchParams.set("reason", "session_expired");
  if (includeCallback) {
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  }

  const response = NextResponse.redirect(loginUrl);

  // Clear stale cookies so the login page starts clean
  response.cookies.set(APP_CONFIG.COOKIES.ACCESS_TOKEN, "", { maxAge: 0, path: "/" });
  response.cookies.set(APP_CONFIG.COOKIES.REFRESH_TOKEN, "", { maxAge: 0, path: "/" });

  return response;
}

/**
 * Prevents browser back/forward cache (bfcache) on protected routes.
 * Ensures hitting the browser back button after logout re-evaluates auth.
 */
function applyNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

// ─── Main Proxy ──────────────────────────────────────────────────────────────

export async function proxy(
  request: NextRequest,
  _event: NextFetchEvent,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const routeType = getRouteType(pathname);

  // ── Skip: static assets and internal Next.js paths ──
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── Skip: API routes (BFF handles auth internally) ──
  if (routeType === "api") {
    return NextResponse.next();
  }

  // ── Public routes — always accessible ──
  if (routeType === "public") {
    return NextResponse.next();
  }

  // ── Auth routes (login, register) — redirect if already authenticated ──
  if (routeType === "auth") {
    if (hasValidToken(request)) {
      const token = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;
      const payload = decodeTokenPayload(token || "");
      const role = payload?.role as string | undefined;
      const destination =
        role?.toUpperCase() === "ADMIN" ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME;
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  // ── Protected routes (user + admin) ──
  // Step 1: Check if access token is valid (exists + not expired)
  if (hasValidToken(request)) {
    // Token is fine — just run RBAC check
    const token = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)!.value;
    const payload = decodeTokenPayload(token);
    const role = payload?.role as string | undefined;

    if (!hasRoleAccess(role, routeType)) {
      // Wrong role — redirect to their correct dashboard
      const destination =
        role?.toUpperCase() === "ADMIN" ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD;
      return NextResponse.redirect(new URL(destination, request.url));
    }

    return applyNoCacheHeaders(NextResponse.next());
  }

  // Step 2: Access token is missing or expired — attempt refresh if we have a refresh token
  if (hasRefreshToken(request)) {
    const refreshToken = getRefreshTokenFromRequest(request)!;
    const newTokens = await attemptTokenRefresh(refreshToken);

    if (newTokens) {
      // Refresh succeeded — build response with new cookies injected
      const refreshedResponse = buildRefreshedResponse(request, newTokens);

      // RBAC check using the new token
      const payload = decodeTokenPayload(newTokens.accessToken);
      const role = payload?.role as string | undefined;

      if (!hasRoleAccess(role, routeType)) {
        const destination =
          role?.toUpperCase() === "ADMIN" ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD;
        return NextResponse.redirect(new URL(destination, request.url));
      }

      return applyNoCacheHeaders(refreshedResponse);
    }

    // Refresh failed (token revoked, backend down, etc.) — force re-login
    return buildExpiredSessionRedirect(request);
  }

  // Step 3: No tokens at all — redirect to appropriate login portal
  const targetLoginPath = routeType === "admin" ? ROUTES.ADMIN_LOGIN : ROUTES.LOGIN;
  const loginUrl = new URL(targetLoginPath, request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Proxy matcher configuration.
 * Excludes static files, images, and Next.js internals.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

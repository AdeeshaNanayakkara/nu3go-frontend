/**
 * CSRF protection middleware utilities.
 * Implements the double-submit cookie pattern.
 *
 * How it works:
 *  1. On every non-API page response, a random CSRF token is set as a
 *     non-HttpOnly cookie (readable by client JS).
 *  2. The apiClient sends that cookie value as an `X-CSRF-Token` header
 *     on every state-changing request (POST/PUT/PATCH/DELETE).
 *  3. BFF route handlers call `validateCsrfToken()` which compares the
 *     header value against the cookie value. Because a cross-origin
 *     attacker cannot read our cookies (SameSite + same-origin policy),
 *     they cannot forge the header.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { APP_CONFIG } from "@/constants/config";

const CSRF_COOKIE = APP_CONFIG.COOKIES.CSRF_TOKEN;
const CSRF_HEADER = "x-csrf-token";
const TOKEN_LENGTH = 32;

/**
 * Generate a hex CSRF token using the Web Crypto API (Edge-compatible).
 */
function generateCsrfToken(): string {
  const bytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Ensures a CSRF cookie exists on the outgoing response.
 * Call this in middleware for page (non-API) responses.
 */
export function ensureCsrfCookie(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const existing = request.cookies.get(CSRF_COOKIE)?.value;
  if (existing && existing.length >= TOKEN_LENGTH) return response;

  const token = generateCsrfToken();
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}

/**
 * Validates the CSRF token on a state-changing BFF request.
 * Returns null if valid, or a 403 NextResponse if invalid.
 */
export function validateCsrfToken(request: NextRequest): NextResponse | null {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  if (
    !cookieToken ||
    !headerToken ||
    cookieToken.length < TOKEN_LENGTH ||
    cookieToken !== headerToken
  ) {
    return NextResponse.json(
      { success: false, error: { message: "Invalid or missing CSRF token." } },
      { status: 403 },
    );
  }

  return null;
}

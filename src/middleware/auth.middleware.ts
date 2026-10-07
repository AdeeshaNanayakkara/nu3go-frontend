/**
 * Auth middleware utilities.
 * Token verification and session extraction logic.
 * Used by the root middleware.ts file.
 *
 * NOTE: This runs on the Edge Runtime — no Node.js-specific APIs allowed.
 */

import { APP_CONFIG } from "@/constants/config";
import type { NextRequest } from "next/server";

/**
 * Extract the access token from the request cookies.
 */
export function getTokenFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;
}

/**
 * Extract the refresh token from the request cookies.
 */
export function getRefreshTokenFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(APP_CONFIG.COOKIES.REFRESH_TOKEN)?.value;
}

/**
 * Check whether a JWT token's `exp` claim is in the past.
 *
 * WARNING: Does NOT verify the signature — only used for routing decisions
 * in middleware. Full verification happens on the backend.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeTokenPayload(token);
    if (!payload?.exp) return false; // No expiry claim → treat as non-expiring
    return Date.now() / 1000 > (payload.exp as number);
  } catch {
    return true;
  }
}

/**
 * Returns true if the request has a structurally valid, non-expired access token.
 */
export function hasValidToken(request: NextRequest): boolean {
  const token = getTokenFromRequest(request);
  if (!token) return false;

  // Basic JWT structure check (3 dot-separated base64 segments)
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  return !isTokenExpired(token);
}

/**
 * Returns true if the request has a refresh token cookie (any non-empty value).
 * Used to decide whether a token refresh attempt is worth making.
 */
export function hasRefreshToken(request: NextRequest): boolean {
  const token = getRefreshTokenFromRequest(request);
  return !!token && token.length > 0;
}

/**
 * Decode JWT payload without verification.
 *
 * WARNING: This does NOT verify the signature. Use only in middleware
 * for routing decisions. Full verification happens on the backend.
 */
export function decodeTokenPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

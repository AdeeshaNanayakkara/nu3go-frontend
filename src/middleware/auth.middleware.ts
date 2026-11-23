/**
 * Auth middleware utilities.
 * Token verification and session extraction logic.
 * Used by the root middleware (proxy.ts).
 *
 * NOTE: This runs on the Edge Runtime — only Web Crypto / jose APIs allowed.
 */

import { jwtVerify, type JWTPayload } from "jose";
import { APP_CONFIG } from "@/constants/config";
import type { NextRequest } from "next/server";

let cachedSecret: Uint8Array | null = null;

function getSecret(): Uint8Array | null {
  if (cachedSecret) return cachedSecret;
  const raw = process.env.JWT_SECRET;
  if (!raw) return null;
  cachedSecret = new TextEncoder().encode(raw);
  return cachedSecret;
}

export function getTokenFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;
}

export function getRefreshTokenFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(APP_CONFIG.COOKIES.REFRESH_TOKEN)?.value;
}

/**
 * Verify a JWT token's signature AND expiry using `jose`.
 * Returns the decoded payload on success, null on any failure.
 */
async function verifyToken(token: string): Promise<JWTPayload | null> {
  const secret = getSecret();
  if (!secret) {
    // No JWT_SECRET configured — fall back to decode-only (dev convenience)
    return decodeTokenPayload(token) as JWTPayload | null;
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Returns true if the request has a signature-verified, non-expired access token.
 * Falls back to decode-only when JWT_SECRET is not set (dev mode).
 */
export async function hasValidToken(request: NextRequest): Promise<boolean> {
  const token = getTokenFromRequest(request);
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const payload = await verifyToken(token);
  return payload !== null;
}

export function hasRefreshToken(request: NextRequest): boolean {
  const token = getRefreshTokenFromRequest(request);
  return !!token && token.length > 0;
}

/**
 * Decode JWT payload without verification.
 * Used ONLY after hasValidToken() has already verified the signature,
 * or as a dev fallback when JWT_SECRET is unset.
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

/**
 * Check whether a JWT token's `exp` claim is in the past.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeTokenPayload(token);
    if (!payload?.exp) return false;
    return Date.now() / 1000 > (payload.exp as number);
  } catch {
    return true;
  }
}

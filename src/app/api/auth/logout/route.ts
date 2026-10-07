import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/auth/logout
 *
 * BFF proxy:
 *  1. Reads refresh_token from HttpOnly cookie
 *  2. Calls backend POST /auth/logout with { refresh_token }
 *  3. Clears both access_token and refresh_token cookies regardless of backend response
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(APP_CONFIG.COOKIES.REFRESH_TOKEN)?.value;

  // Best-effort call to backend to revoke the refresh token
  if (refreshToken) {
    try {
      await fetch(BACKEND_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch (err) {
      // Non-fatal — we still clear cookies even if backend call fails
      console.error("[BFF /api/auth/logout] Backend error:", err);
    }
  }

  const response = NextResponse.json({ success: true });

  // Always clear auth cookies
  response.cookies.set(APP_CONFIG.COOKIES.ACCESS_TOKEN, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set(APP_CONFIG.COOKIES.REFRESH_TOKEN, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

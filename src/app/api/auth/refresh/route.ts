import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/auth/refresh
 *
 * BFF proxy:
 *  1. Reads the HttpOnly refresh_token cookie
 *  2. Forwards to backend POST /auth/refresh
 *  3. Updates access_token and refresh_token cookies with new values
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(APP_CONFIG.COOKIES.REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: { message: "No refresh token found." } },
      { status: 401 }
    );
  }

  try {
    const backendRes = await fetch(BACKEND_ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      // Refresh token expired or invalid — clear cookies
      const response = NextResponse.json(
        { success: false, error: { message: "Session expired. Please sign in again." } },
        { status: 401 }
      );
      response.cookies.set(APP_CONFIG.COOKIES.ACCESS_TOKEN, "", { maxAge: 0, path: "/" });
      response.cookies.set(APP_CONFIG.COOKIES.REFRESH_TOKEN, "", { maxAge: 0, path: "/" });
      return response;
    }

    const { access_token, refresh_token, user } = data.data;
    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({ success: true, data: { user } });

    response.cookies.set(APP_CONFIG.COOKIES.ACCESS_TOKEN, access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    if (refresh_token) {
      response.cookies.set(APP_CONFIG.COOKIES.REFRESH_TOKEN, refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (err) {
    console.error("[BFF /api/auth/refresh] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error during token refresh." } },
      { status: 500 }
    );
  }
}

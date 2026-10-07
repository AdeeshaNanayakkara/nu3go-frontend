import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/auth/google
 *
 * BFF proxy for Google OAuth sign-in:
 *  1. Receives { id_token } from the client (credential from Google Identity Services).
 *  2. Forwards to backend POST /api/v1/auth/google.
 *  3. Backend validates the Google ID token, creates/finds the user.
 *  4. Returns access_token, refresh_token, and user — stored in HttpOnly cookies.
 *  5. Returns user object to client (no raw tokens).
 *
 * No GOOGLE_CLIENT_SECRET is required here — the id_token is obtained directly
 * from the GoogleLogin component which uses Google's GIS iframe to handle the
 * full sign-in flow including consent and credential issuance.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_token } = body;

    if (!id_token) {
      return NextResponse.json(
        { success: false, error: { message: "Google ID token is required." } },
        { status: 400 }
      );
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.AUTH.GOOGLE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      const message =
        data?.error?.message || "Google sign-in failed. Please try again.";
      return NextResponse.json(
        { success: false, error: { message } },
        { status: backendRes.status || 400 }
      );
    }

    const { access_token, refresh_token, user } = data.data || {};

    if (!access_token || !user) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid response from server." } },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: { user },
    });

    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set(APP_CONFIG.COOKIES.ACCESS_TOKEN, access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    if (refresh_token) {
      response.cookies.set(APP_CONFIG.COOKIES.REFRESH_TOKEN, refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (err) {
    console.error("[BFF /api/auth/google] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error. Please try again later." } },
      { status: 500 }
    );
  }
}

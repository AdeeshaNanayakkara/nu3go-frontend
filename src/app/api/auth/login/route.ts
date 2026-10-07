import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/auth/login
 *
 * BFF (Backend-for-Frontend) proxy:
 *  1. Forwards { email, password } to the real backend POST /auth/login
 *  2. Extracts access_token, refresh_token, and user from the response
 *  3. Stores tokens in HttpOnly, Secure cookies (never exposed to JS)
 *  4. Returns user object to the client (no tokens in JSON body)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Email and password are required." } },
        { status: 400 }
      );
    }

    // Forward to the real backend
    const backendRes = await fetch(BACKEND_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      const message =
        data?.error?.message ||
        (backendRes.status === 401
          ? "Invalid email or password."
          : "Login failed. Please try again.");
      return NextResponse.json(
        { success: false, error: { message } },
        { status: backendRes.status }
      );
    }

    const { access_token, refresh_token, user } = data.data;

    if (!access_token || !user) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid response from server." } },
        { status: 502 }
      );
    }

    // Build response — return user info but NOT tokens in JSON
    const response = NextResponse.json({
      success: true,
      data: { user },
    });

    const isProduction = process.env.NODE_ENV === "production";

    // Set HttpOnly cookies for secure token storage
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
    console.error("[BFF /api/auth/login] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error. Please try again later." } },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/auth/verify
 *
 * BFF proxy for email OTP verification:
 *  1. Forwards { email, otp } to backend POST /api/v1/auth/verify
 *  2. On success, backend returns access_token, refresh_token, and user
 *  3. Stores tokens in HttpOnly, Secure cookies
 *  4. Returns user object to client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: { message: "Email and OTP code are required." } },
        { status: 400 }
      );
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.AUTH.VERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      const message =
        data?.error?.message ||
        (backendRes.status === 401
          ? "Invalid or expired OTP code."
          : "Verification failed. Please try again.");
      return NextResponse.json(
        { success: false, error: { message } },
        { status: backendRes.status || 400 }
      );
    }

    const { access_token, refresh_token, user } = data.data || {};

    const response = NextResponse.json({
      success: true,
      data: { user },
    });

    const isProduction = process.env.NODE_ENV === "production";

    // Set HttpOnly cookies if tokens were returned upon verification
    if (access_token) {
      response.cookies.set(APP_CONFIG.COOKIES.ACCESS_TOKEN, access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });
    }

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
    console.error("[BFF /api/auth/verify] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error. Please try again later." } },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";

/**
 * POST /api/auth/forgot-password
 *
 * BFF proxy for forgot password:
 *  1. Receives { email } from client
 *  2. Forwards to backend POST /api/v1/auth/forgot-password
 *  3. Backend sends a 6-digit OTP to the user's email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: "Email address is required." } },
        { status: 400 }
      );
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      const message = data?.error?.message || "Failed to send reset OTP. Please check your email.";
      return NextResponse.json(
        { success: false, error: { message } },
        { status: backendRes.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "OTP sent successfully to your email.",
    });
  } catch (err) {
    console.error("[BFF /api/auth/forgot-password] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error. Please try again later." } },
      { status: 500 }
    );
  }
}

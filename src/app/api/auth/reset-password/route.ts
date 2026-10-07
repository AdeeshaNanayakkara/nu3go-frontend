import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";

/**
 * POST /api/auth/reset-password
 *
 * BFF proxy for resetting password:
 *  1. Receives { email, new_password, otp } from client
 *  2. Forwards to backend POST /api/v1/auth/reset-password
 *  3. Backend validates OTP and updates the password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, new_password, otp } = body;

    if (!email || !new_password || !otp) {
      return NextResponse.json(
        { success: false, error: { message: "Email, new password, and OTP are required." } },
        { status: 400 }
      );
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, new_password, otp }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      const message = data?.error?.message || "Failed to reset password. Check your OTP and try again.";
      return NextResponse.json(
        { success: false, error: { message } },
        { status: backendRes.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Password reset successfully.",
    });
  } catch (err) {
    console.error("[BFF /api/auth/reset-password] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error. Please try again later." } },
      { status: 500 }
    );
  }
}

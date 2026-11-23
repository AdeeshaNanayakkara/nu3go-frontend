import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { resetPasswordSchema } from "@/schemas/auth.schema";
import { parseBody } from "@/lib/api/validate";
import { logBffError } from "@/lib/api/safe-log";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseBody(body, resetPasswordSchema);
    if ("error" in parsed) return parsed.error;

    const { email, new_password, otp } = parsed.data;

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
    logBffError("[BFF /api/auth/reset-password]", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error. Please try again later." } },
      { status: 500 }
    );
  }
}

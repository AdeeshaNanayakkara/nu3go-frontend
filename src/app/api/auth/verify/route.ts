import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";
import { verifySchema } from "@/schemas/auth.schema";
import { parseBody } from "@/lib/api/validate";
import { logBffError } from "@/lib/api/safe-log";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseBody(body, verifySchema);
    if ("error" in parsed) return parsed.error;

    const { email, otp } = parsed.data;

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

    if (access_token) {
      response.cookies.set(APP_CONFIG.COOKIES.ACCESS_TOKEN, access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });
    }

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
    logBffError("[BFF /api/auth/verify]", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error. Please try again later." } },
      { status: 500 }
    );
  }
}

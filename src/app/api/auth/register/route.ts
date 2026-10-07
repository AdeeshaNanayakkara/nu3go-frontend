import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/auth/register
 *
 * BFF proxy:
 *  1. Forwards { email, password, role? } to backend POST /auth/register
 *  2. Registration creates account and backend sends OTP to email for verification
 *  3. Returns the user object — client must then verify OTP at /auth/verify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Email and password are required." } },
        { status: 400 }
      );
    }

    // Build backend payload — role is optional (defaults to CUSTOMER)
    const payload: Record<string, string> = { email, password };
    if (role) payload.role = role;

    const backendRes = await fetch(BACKEND_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      const message =
        data?.error?.message ||
        (backendRes.status === 409
          ? "An account with this email already exists."
          : "Registration failed. Please try again.");
      return NextResponse.json(
        { success: false, error: { message } },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data, // UserRes — contains id, email, role, is_verified
    });
  } catch (err) {
    console.error("[BFF /api/auth/register] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error. Please try again later." } },
      { status: 500 }
    );
  }
}

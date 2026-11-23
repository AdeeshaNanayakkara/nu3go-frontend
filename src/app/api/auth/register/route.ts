import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { registerSchema } from "@/schemas/auth.schema";
import { parseBody } from "@/lib/api/validate";
import { logBffError } from "@/lib/api/safe-log";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseBody(body, registerSchema);
    if ("error" in parsed) return parsed.error;

    const { first_name, last_name, email, phone, address, city, password } = parsed.data;

    const backendRes = await fetch(BACKEND_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, email, phone, address, city, password }),
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
      data: data.data,
    });
  } catch (err) {
    logBffError("[BFF /api/auth/register]", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error. Please try again later." } },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { APP_CONFIG } from "@/constants/config";

/**
 * GET /api/auth/me
 *
 * Decodes the access_token cookie and returns the user payload.
 * NOTE: Full JWT verification is done by the backend on protected routes.
 * This endpoint is for the client to hydrate auth state on page load.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: "Not authenticated." } },
      { status: 401 }
    );
  }

  try {
    // Decode JWT payload (not verify — backend verifies on actual requests)
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token format");

    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadBase64 + "=".repeat((4 - (payloadBase64.length % 4)) % 4);
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));

    // Check if token is expired
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return NextResponse.json(
        { success: false, error: { message: "Token expired." } },
        { status: 401 }
      );
    }

    const userId = payload.sub || payload.id || payload.user_id || payload.userId || "";
    const userEmail = payload.email || payload.user_email || "";
    const userRole = (payload.role || payload.user_role || "CUSTOMER").toUpperCase();
    const userName = payload.name || payload.full_name || "";
    const profilePicture = payload.profile_picture_url || payload.picture || "";

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userId,
          email: userEmail,
          role: userRole,
          name: userName,
          profile_picture_url: profilePicture,
        },
      },
    });
  } catch (err) {
    console.error("[BFF /api/auth/me] Error decoding token:", err);
    return NextResponse.json(
      { success: false, error: { message: "Invalid token." } },
      { status: 401 }
    );
  }
}

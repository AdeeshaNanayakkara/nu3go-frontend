import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * GET /api/admin/users
 *
 * BFF (Backend-for-Frontend) proxy:
 *  1. Extracts access_token HttpOnly cookie from incoming request
 *  2. Forwards search parameters (page, limit, search) to backend GET /api/v1/users
 *  3. Returns users list payload + pagination metadata to client
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    // Forward search params (page, limit, etc.) to backend URL
    const { searchParams } = request.nextUrl;
    const backendUrl = new URL(BACKEND_ENDPOINTS.USERS.LIST);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    // Forward request to backend /api/v1/users
    const backendRes = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        data || { success: false, error: { message: "Failed to fetch users." } },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[BFF /api/admin/users] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching users." } },
      { status: 500 }
    );
  }
}

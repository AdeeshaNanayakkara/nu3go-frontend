import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * GET /api/v1/subscription-plans — List available subscription plans (public endpoint, auth optional)
 *
 * Forwards query params (limit, page, type, is_active, etc.) to the backend.
 * Returns an empty array gracefully on backend errors so the dashboard/plans page
 * degrades cleanly without a 404 in the network tab.
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    const { searchParams } = new URL(request.url);
    const backendUrl = new URL(BACKEND_ENDPOINTS.SUBSCRIPTION_PLANS.LIST);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const backendRes = await fetch(backendUrl.toString(), {
      method: "GET",
      headers,
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/v1/subscription-plans GET] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Server error fetching subscription plans." },
      },
      { status: 500 }
    );
  }
}


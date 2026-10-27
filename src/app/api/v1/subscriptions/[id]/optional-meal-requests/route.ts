import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * GET /api/v1/subscriptions/[id]/optional-meal-requests — List optional meal requests for a subscription
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const backendUrl = new URL(BACKEND_ENDPOINTS.OPTIONAL_MEAL_REQUESTS.SUBSCRIPTION_REQUESTS(id));
    searchParams.forEach((val, key) => {
      backendUrl.searchParams.set(key, val);
    });

    const backendRes = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    let data: any;
    try {
      data = await backendRes.json();
    } catch {
      data = {
        success: backendRes.ok,
        message: backendRes.statusText || (backendRes.ok ? "Success" : "Failed to parse response"),
      };
    }
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/v1/subscriptions/[id]/optional-meal-requests GET] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching subscription optional meal requests." } },
      { status: 500 }
    );
  }
}

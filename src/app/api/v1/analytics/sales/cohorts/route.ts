import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * GET /api/v1/analytics/sales/cohorts
 *
 * BFF proxy to backend:
 * GET http://.../api/v1/analytics/sales/cohorts?months=...
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

    const { searchParams } = new URL(request.url);
    const backendUrl = new URL(BACKEND_ENDPOINTS.ANALYTICS.SALES_COHORTS);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    const backendRes = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    let data: unknown;
    try {
      data = await backendRes.json();
    } catch {
      data = {
        success: backendRes.ok,
        message: backendRes.statusText || (backendRes.ok ? "Success" : "Failed to parse backend response"),
      };
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/v1/analytics/sales/cohorts GET] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching sales cohorts analytics." } },
      { status: 500 }
    );
  }
}


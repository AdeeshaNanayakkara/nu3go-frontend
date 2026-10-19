import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/v1/meal-cancellations — Cancel a meal delivery for a specific date and subscription
 * GET /api/v1/meal-cancellations — List meal cancellations
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body?.subscription_id || !body?.delivery_date) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Both subscription_id and delivery_date are required." },
        },
        { status: 400 }
      );
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.MEAL_CANCELLATIONS.CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        subscription_id: body.subscription_id,
        delivery_date: body.delivery_date,
        reason: body.reason || "Customer requested cancellation",
      }),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/v1/meal-cancellations POST] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error cancelling meal." } },
      { status: 500 }
    );
  }
}

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
    const backendUrl = new URL(BACKEND_ENDPOINTS.MEAL_CANCELLATIONS.LIST);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    const backendRes = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/v1/meal-cancellations GET] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching meal cancellations." } },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/v1/optional-meal-requests — Request an optional meal for a subscription date
 * GET /api/v1/optional-meal-requests — List all optional meal requests (Admin)
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

    if (!body?.subscription_id || !body?.delivery_date || !body?.meal_id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "subscription_id, delivery_date, and meal_id are required." },
        },
        { status: 400 }
      );
    }

    const cleanDate = String(body.delivery_date).split("T")[0].trim();

    const backendRes = await fetch(BACKEND_ENDPOINTS.OPTIONAL_MEAL_REQUESTS.CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        subscription_id: body.subscription_id,
        delivery_date: cleanDate,
        meal_id: body.meal_id,
      }),
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
    console.error("[BFF /api/v1/optional-meal-requests POST] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error requesting optional meal." } },
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
    const backendUrl = new URL(BACKEND_ENDPOINTS.OPTIONAL_MEAL_REQUESTS.LIST);
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
    console.error("[BFF /api/v1/optional-meal-requests GET] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching optional meal requests." } },
      { status: 500 }
    );
  }
}

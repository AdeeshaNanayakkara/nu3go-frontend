import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * GET /api/admin/meals — List meals with pagination
 * POST /api/admin/meals — Create a new meal
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

    const { searchParams } = request.nextUrl;
    const backendUrl = new URL(BACKEND_ENDPOINTS.MEALS.LIST);
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
    console.error("[BFF /api/admin/meals GET] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching meals." } },
      { status: 500 }
    );
  }
}

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

    const backendRes = await fetch(BACKEND_ENDPOINTS.MEALS.CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/admin/meals POST] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error creating meal." } },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";
import { logBffError } from "@/lib/api/safe-log";

/**
 * GET /api/v1/holidays
 *
 * BFF proxy to backend:
 * GET http://.../api/v1/holidays?page=&limit=&status=&from=&to=
 * Lists draft and published holidays ordered by date.
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
    const backendUrl = new URL(BACKEND_ENDPOINTS.HOLIDAYS.LIST);
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
    logBffError("[BFF /api/v1/holidays GET]", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching holidays." } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/holidays
 *
 * BFF proxy to backend:
 * POST http://.../api/v1/holidays
 * Creates one or more draft holidays.
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

    const backendRes = await fetch(BACKEND_ENDPOINTS.HOLIDAYS.CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
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
    logBffError("[BFF /api/v1/holidays POST]", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error creating holidays." } },
      { status: 500 }
    );
  }
}

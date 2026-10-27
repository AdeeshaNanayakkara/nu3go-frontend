import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/v1/optional-meal-requests/[id]/cancel — Cancel an optional meal request
 */
export async function POST(
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: "Request ID is required." } },
        { status: 400 }
      );
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.OPTIONAL_MEAL_REQUESTS.CANCEL(id), {
      method: "POST",
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
    console.error("[BFF /api/v1/optional-meal-requests/[id]/cancel POST] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error cancelling optional meal request." } },
      { status: 500 }
    );
  }
}

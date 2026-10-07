import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/v1/subscriptions/[id]/cancel-renewal — Cancel auto-renewal for a subscription
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

    const backendRes = await fetch(BACKEND_ENDPOINTS.SUBSCRIPTIONS.CANCEL_RENEWAL(id), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/v1/subscriptions/[id]/cancel-renewal POST] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error cancelling auto-renewal." } },
      { status: 500 }
    );
  }
}

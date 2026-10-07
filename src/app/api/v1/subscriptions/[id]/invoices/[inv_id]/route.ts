import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * GET /api/v1/subscriptions/[id]/invoices/[inv_id] — Retrieve single invoice detail for a subscription
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; inv_id: string }> }
) {
  try {
    const { id, inv_id } = await params;
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.SUBSCRIPTIONS.INVOICE_DETAIL(id, inv_id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/v1/subscriptions/[id]/invoices/[inv_id] GET] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching invoice detail." } },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

interface Params {
  params: Promise<{ id: string; planId: string }>;
}

/**
 * PUT /api/admin/packages/[id]/plans/[planId]/price — Update price for a specific assigned plan
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id, planId } = await params;
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const body = await request.json();

    const backendRes = await fetch(
      BACKEND_ENDPOINTS.PACKAGES.UPDATE_PLAN_PRICE(id, planId),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/admin/packages/[id]/plans/[planId]/price PUT] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error updating plan price." } },
      { status: 500 }
    );
  }
}

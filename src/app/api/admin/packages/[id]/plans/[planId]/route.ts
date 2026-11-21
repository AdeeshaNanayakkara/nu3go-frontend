import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";
import { logBffError } from "@/lib/api/safe-log";

interface Params {
  params: Promise<{ id: string; planId: string }>;
}

/**
 * DELETE /api/admin/packages/[id]/plans/[planId] — Unassign a subscription plan from a package
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id, planId } = await params;
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const backendRes = await fetch(
      BACKEND_ENDPOINTS.PACKAGES.UNASSIGN_PLAN(id, planId),
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    logBffError("[BFF /api/admin/packages/[id]/plans/[planId] DELETE]", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error unassigning plan." } },
      { status: 500 }
    );
  }
}

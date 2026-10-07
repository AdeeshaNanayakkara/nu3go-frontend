import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * DELETE /api/admin/discounts/[id]/packages/[packageId] — Unassign a package from a discount
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const { id, packageId } = await params;
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const backendRes = await fetch(
      BACKEND_ENDPOINTS.DISCOUNTS.UNASSIGN_PACKAGE(id, packageId),
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
    console.error("[BFF /api/admin/discounts/[id]/packages/[packageId] DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error unassigning package from discount." } },
      { status: 500 }
    );
  }
}

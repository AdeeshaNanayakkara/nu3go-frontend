import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * DELETE /api/v1/deliveries/[id]
 *
 * BFF proxy to backend:
 * DELETE http://.../api/v1/deliveries/{id}
 * Un-marks a previously marked delivery using its delivery_id.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const backendUrl = BACKEND_ENDPOINTS.DELIVERIES.UNDO(id);

    const backendRes = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    let data: any;
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
    console.error("[BFF /api/v1/deliveries/[id] DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error un-marking delivery." } },
      { status: 500 }
    );
  }
}

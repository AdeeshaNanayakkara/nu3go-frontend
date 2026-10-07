import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

interface Params {
  params: Promise<{ packageId: string }>;
}

/**
 * GET /api/admin/menus/packages/[packageId]/meals — Fetch meals for a given package ID
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { packageId } = await params;
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const backendUrl = new URL(BACKEND_ENDPOINTS.MENUS.PACKAGE_MEALS(packageId));
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
    console.error("[BFF /api/admin/menus/packages/[packageId]/meals GET] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching package meals." } },
      { status: 500 }
    );
  }
}

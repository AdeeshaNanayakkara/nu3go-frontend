import { NextResponse, type NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";

/**
 * GET /api/public/packages/[id]
 * Public endpoint to fetch details of a specific package including assigned plans and menus.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Package ID is required" },
        { status: 400 }
      );
    }

    const res = await fetch(BACKEND_ENDPOINTS.PUBLIC_PACKAGES.DETAIL(id), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { success: false, message: `Package not found or HTTP ${res.status}` },
      { status: res.status }
    );
  } catch (err) {
    console.error("[BFF /api/public/packages/[id] GET] Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error fetching package details" },
      { status: 500 }
    );
  }
}

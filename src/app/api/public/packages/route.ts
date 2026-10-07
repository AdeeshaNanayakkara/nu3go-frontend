import { NextResponse } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";

/**
 * GET /api/public/packages
 * Public endpoint to fetch all active meal packages with their assigned subscription plans.
 * Cached with Next.js ISR revalidation (60s).
 */
export async function GET() {
  try {
    const res = await fetch(BACKEND_ENDPOINTS.PUBLIC_PACKAGES.LIST, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { success: false, data: [], message: `Backend responded with HTTP ${res.status}` },
      { status: res.status }
    );
  } catch (err) {
    console.error("[BFF /api/public/packages GET] Error:", err);
    return NextResponse.json(
      { success: false, data: [], message: "Internal server error fetching packages" },
      { status: 500 }
    );
  }
}

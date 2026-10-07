import { NextResponse } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";

/**
 * GET /api/zones — Public endpoint to fetch all available delivery zones
 * Cached with ISR revalidation for fast landing page loads.
 */
export async function GET() {
  const backendBase =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://13.201.222.82:80";

  try {
    const res = await fetch(BACKEND_ENDPOINTS.ZONES.LIST, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Fallback attempt to direct URL
    const fallbackRes = await fetch(`${backendBase}/api/v1/zones`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 },
    });

    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (err) {
    console.error("[BFF /api/zones GET] Error:", err);
    return NextResponse.json({ success: true, data: [] });
  }
}

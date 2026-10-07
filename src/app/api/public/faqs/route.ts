import { NextResponse } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";

/**
 * GET /api/public/faqs
 * Public endpoint to fetch all active FAQs from backend /api/v1/public/faqs.
 */
export async function GET() {
  const backendBase =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://13.201.222.82:80";

  try {
    const res = await fetch(BACKEND_ENDPOINTS.PUBLIC_FAQS.LIST, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Direct fallback attempt to backend
    const fallbackRes = await fetch(`${backendBase}/api/v1/public/faqs`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { success: false, data: [], message: `Backend responded with HTTP ${res.status}` },
      { status: res.status }
    );
  } catch (err) {
    console.error("[BFF /api/public/faqs GET] Error:", err);
    return NextResponse.json(
      { success: false, data: [], message: "Internal server error fetching public FAQs" },
      { status: 500 }
    );
  }
}

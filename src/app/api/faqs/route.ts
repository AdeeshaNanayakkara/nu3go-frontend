import { NextResponse } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";

/**
 * GET /api/faqs — Public endpoint to fetch all active FAQs
 */
export async function GET() {
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

    return NextResponse.json({ success: true, data: [] });
  } catch (err) {
    console.error("[BFF /api/faqs GET] Error:", err);
    return NextResponse.json({ success: true, data: [] });
  }
}


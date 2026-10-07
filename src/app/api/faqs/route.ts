import { NextResponse } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";

/**
 * GET /api/faqs — Public endpoint to fetch all active FAQs
 */
export async function GET() {
  const backendBase =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://13.201.222.82:80";

  try {
    // 1. Try public /public/faqs endpoint
    const res1 = await fetch(BACKEND_ENDPOINTS.PUBLIC_FAQS.LIST, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res1.ok) {
      const data1 = await res1.json();
      return NextResponse.json(data1);
    }

    // 2. Try direct fallback /api/v1/public/faqs
    const res2 = await fetch(`${backendBase}/api/v1/public/faqs`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res2.ok) {
      const data2 = await res2.json();
      return NextResponse.json(data2);
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (err) {
    console.error("[BFF /api/faqs GET] Error:", err);
    return NextResponse.json({ success: true, data: [] });
  }
}


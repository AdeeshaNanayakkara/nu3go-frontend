import { NextResponse } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { logBffError } from "@/lib/api/safe-log";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/reviews/summary — Retrieve review statistics & rating distribution
 */
export async function GET() {
  try {
    const backendRes = await fetch(BACKEND_ENDPOINTS.REVIEWS.PUBLIC_SUMMARY, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    logBffError("[BFF /api/v1/reviews/summary GET]", err);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch review summary." },
      },
      { status: 500 }
    );
  }
}

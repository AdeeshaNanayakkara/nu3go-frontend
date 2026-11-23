import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";
import { logBffError } from "@/lib/api/safe-log";

/**
 * PATCH /api/v1/reviews/[id]/visibility — Publish or hide a review (Admin)
 * Body: { is_published: boolean }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Unauthorized. Access token missing." },
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);

    if (body === null || typeof body?.is_published !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: { message: "is_published (boolean) is required in request body." },
        },
        { status: 400 }
      );
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.REVIEWS.VISIBILITY(id), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ is_published: body.is_published }),
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    logBffError("[BFF /api/v1/reviews/[id]/visibility PATCH]", err);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Server error updating review visibility." },
      },
      { status: 500 }
    );
  }
}

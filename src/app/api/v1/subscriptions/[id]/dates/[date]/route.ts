import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

async function proxy(
  request: NextRequest,
  id: string,
  date: string,
  method: "DELETE" | "PATCH",
  body?: unknown
) {
  const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized. Access token missing." } },
      { status: 401 }
    );
  }

  const backendRes = await fetch(BACKEND_ENDPOINTS.SUBSCRIPTIONS.DATE_DETAIL(id, date), {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  let data: unknown;
  try {
    data = await backendRes.json();
  } catch {
    data = {
      success: backendRes.ok,
      message: backendRes.statusText || (backendRes.ok ? "Success" : "Failed to parse backend response"),
    };
  }

  return NextResponse.json(data, { status: backendRes.status });
}

/**
 * DELETE /api/v1/subscriptions/[id]/dates/[date] — Unschedule a date (CUSTOM plan)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; date: string }> }
) {
  try {
    const { id, date } = await params;
    return await proxy(request, id, date, "DELETE");
  } catch (err) {
    console.error("[BFF /api/v1/subscriptions/[id]/dates/[date] DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error unscheduling delivery date." } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/subscriptions/[id]/dates/[date] — Move a date and/or change its location (CUSTOM plan)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; date: string }> }
) {
  try {
    const { id, date } = await params;
    const body = await request.json();
    return await proxy(request, id, date, "PATCH", body);
  } catch (err) {
    console.error("[BFF /api/v1/subscriptions/[id]/dates/[date] PATCH] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error updating delivery date." } },
      { status: 500 }
    );
  }
}

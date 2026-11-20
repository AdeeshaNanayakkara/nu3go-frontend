import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

async function proxy(
  request: NextRequest,
  id: string,
  method: "GET" | "PATCH" | "DELETE",
  body?: unknown
) {
  const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized. Access token missing." } },
      { status: 401 }
    );
  }

  const backendRes = await fetch(BACKEND_ENDPOINTS.HOLIDAYS.DETAIL(id), {
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
 * GET /api/v1/holidays/[id] — holiday detail with impact.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await proxy(request, id, "GET");
  } catch (err) {
    console.error("[BFF /api/v1/holidays/[id] GET] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching holiday." } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/holidays/[id] — update a draft holiday.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    return await proxy(request, id, "PATCH", body);
  } catch (err) {
    console.error("[BFF /api/v1/holidays/[id] PATCH] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error updating holiday." } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/holidays/[id] — delete a draft holiday.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return await proxy(request, id, "DELETE");
  } catch (err) {
    console.error("[BFF /api/v1/holidays/[id] DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error deleting holiday." } },
      { status: 500 }
    );
  }
}

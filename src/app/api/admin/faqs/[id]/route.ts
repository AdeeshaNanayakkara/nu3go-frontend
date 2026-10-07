import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/faqs/[id] — Update an existing FAQ
 * DELETE /api/admin/faqs/[id] — Delete an FAQ by ID
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const body = await request.json();

    const backendRes = await fetch(BACKEND_ENDPOINTS.FAQS.UPDATE(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/admin/faqs/[id] PUT] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error updating FAQ." } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.FAQS.DELETE(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/admin/faqs/[id] DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error deleting FAQ." } },
      { status: 500 }
    );
  }
}

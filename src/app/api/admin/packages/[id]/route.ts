import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/packages/[id] — Update an existing package
 * DELETE /api/admin/packages/[id] — Soft delete a package by ID
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

    const backendRes = await fetch(BACKEND_ENDPOINTS.PACKAGES.UPDATE(id), {
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
    console.error("[BFF /api/admin/packages/[id] PUT] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error updating package." } },
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

    const backendRes = await fetch(BACKEND_ENDPOINTS.PACKAGES.DELETE(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/admin/packages/[id] DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error deleting package." } },
      { status: 500 }
    );
  }
}

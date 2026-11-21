import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";
import { logBffError } from "@/lib/api/safe-log";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/packages/[id]/plans — Retrieve assigned plans for package
 * POST /api/admin/packages/[id]/plans — Assign subscription plans to package
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.PACKAGES.PLANS(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    logBffError("[BFF /api/admin/packages/[id]/plans GET]", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching package plans." } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
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

    const backendRes = await fetch(BACKEND_ENDPOINTS.PACKAGES.PLANS(id), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    logBffError("[BFF /api/admin/packages/[id]/plans POST]", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error assigning plans to package." } },
      { status: 500 }
    );
  }
}

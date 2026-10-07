import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

interface ContextParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/users/[id]/status
 *
 * BFF (Backend-for-Frontend) proxy:
 *  1. Extracts access_token HttpOnly cookie
 *  2. Forwards status update request ({ is_active: boolean }) to backend /api/v1/users/{id}/status (or /api/v1/users/{id})
 *  3. Returns updated user response payload or detailed error message
 */
export async function PUT(request: NextRequest, { params }: ContextParams) {
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
    const isActive = body.is_active ?? body.active ?? true;

    // Potential endpoints & payload format combinations
    const candidateEndpoints = [
      { url: BACKEND_ENDPOINTS.USERS.UPDATE_STATUS(id), method: "PUT", payload: { is_active: isActive, status: isActive ? "ACTIVE" : "SUSPENDED" } },
      { url: BACKEND_ENDPOINTS.USERS.UPDATE_STATUS(id), method: "PATCH", payload: { is_active: isActive, status: isActive ? "ACTIVE" : "SUSPENDED" } },
      { url: BACKEND_ENDPOINTS.USERS.UPDATE_STATUS(id), method: "PUT", payload: { is_active: isActive } },
      { url: BACKEND_ENDPOINTS.USERS.UPDATE_STATUS(id), method: "PATCH", payload: { is_active: isActive } },
      { url: BACKEND_ENDPOINTS.USERS.DETAIL(id), method: "PUT", payload: { is_active: isActive } },
      { url: BACKEND_ENDPOINTS.USERS.DETAIL(id), method: "PATCH", payload: { is_active: isActive } },
    ];

    let lastStatus = 500;
    let lastErrorData: any = null;

    for (const candidate of candidateEndpoints) {
      try {
        const res = await fetch(candidate.url, {
          method: candidate.method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(candidate.payload),
        });

        const resText = await res.text();
        let resJson: any = null;
        try {
          resJson = JSON.parse(resText);
        } catch {
          resJson = { success: false, error: { message: resText || `HTTP ${res.status}` } };
        }

        if (res.ok) {
          return NextResponse.json(resJson);
        }

        lastStatus = res.status;
        lastErrorData = resJson;

        // If not a 404 or 405 method error, break and return the exact backend error payload
        if (res.status !== 404 && res.status !== 405) {
          break;
        }
      } catch (e) {
        console.warn(`[BFF User Status] Candidate ${candidate.method} ${candidate.url} failed:`, e);
      }
    }

    const errorMessage =
      lastErrorData?.error?.message ||
      lastErrorData?.message ||
      "Failed to update user status on server.";

    return NextResponse.json(
      lastErrorData || { success: false, error: { message: errorMessage } },
      { status: lastStatus }
    );
  } catch (err) {
    console.error("[BFF /api/admin/users/[id]/status] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: err instanceof Error ? err.message : "Server error updating user status." } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: ContextParams) {
  return PUT(request, context);
}

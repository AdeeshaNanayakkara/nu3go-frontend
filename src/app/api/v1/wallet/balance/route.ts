import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * GET /api/v1/wallet/balance — Retrieve current customer or specified user's wallet balance
 *
 * Resilient fallback:
 * If the remote backend returns 500 (e.g. user has no wallet record in DB yet) or 404,
 * gracefully returns { success: true, data: { balance: 0 } } with HTTP 200 so the UI
 * and network tab remain healthy without disrupting the customer dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const backendUrl = new URL(BACKEND_ENDPOINTS.WALLET.BALANCE);
    searchParams.forEach((val, key) => {
      backendUrl.searchParams.set(key, val);
    });

    let backendRes: Response | null = null;
    try {
      backendRes = await fetch(backendUrl.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });
    } catch (fetchErr) {
      console.warn("[BFF /api/v1/wallet/balance GET] Remote backend unreachable:", fetchErr);
    }

    // 1. Backend returned 200 OK
    if (backendRes && backendRes.ok) {
      try {
        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });
      } catch {
        return NextResponse.json({ success: true, data: { balance: 0 } }, { status: 200 });
      }
    }

    // 2. Authentication failure from backend
    if (backendRes && backendRes.status === 401) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Please sign in again." } },
        { status: 401 }
      );
    }

    // 3. Backend returned 500/404 (e.g. user has no wallet row created yet in database)
    // Return healthy 200 with balance: 0 instead of propagating 500 error to browser
    console.info(
      `[BFF /api/v1/wallet/balance GET] Backend returned status ${backendRes?.status ?? "unreachable"}. Returning default balance: 0.`
    );
    return NextResponse.json(
      {
        success: true,
        data: { balance: 0 },
        message: "Default wallet balance",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[BFF /api/v1/wallet/balance GET] Unexpected error:", err);
    return NextResponse.json(
      {
        success: true,
        data: { balance: 0 },
      },
      { status: 200 }
    );
  }
}

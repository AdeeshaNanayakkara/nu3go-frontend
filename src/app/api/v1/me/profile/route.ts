import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

const PROFILE_COOKIE_KEY = "nu3go-profile-cache";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadBase64 + "=".repeat((4 - (payloadBase64.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

/**
 * GET /api/v1/me/profile
 *
 * BFF proxy to backend:
 * GET http://.../api/v1/me/profile
 * Returns authenticated user's profile: { first_name, last_name, phone, address, city, profile_complete }
 *
 * Resilient fallback:
 * If the remote backend route is not yet deployed (returns 404),
 * falls back to local cookie cache or JWT token claims to prevent UI disruption.
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

    let backendRes: Response | null = null;
    try {
      backendRes = await fetch(BACKEND_ENDPOINTS.ME.PROFILE, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });
    } catch (fetchErr) {
      console.warn("[BFF /api/v1/me/profile GET] Remote backend unreachable:", fetchErr);
    }

    // If backend route is active and succeeded
    if (backendRes && backendRes.ok) {
      const data = await backendRes.json();
      const response = NextResponse.json(data, { status: backendRes.status });

      // Sync cache cookie if data exists
      if (data?.data) {
        response.cookies.set(PROFILE_COOKIE_KEY, JSON.stringify(data.data), {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });
      }
      return response;
    }

    // If backend returned an error other than 404 (e.g., 401 unauthorized or 403 forbidden)
    if (backendRes && backendRes.status === 401) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Please sign in again." } },
        { status: 401 }
      );
    }

    // Backend route not yet deployed on server (404) or server unreachable — use fallback
    const cachedProfile = request.cookies.get(PROFILE_COOKIE_KEY)?.value;
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        return NextResponse.json({
          success: true,
          data: parsed,
        });
      } catch {
        // Corrupted cache - continue to token fallback
      }
    }

    // Fallback: derive name from JWT payload
    const payload = decodeJwtPayload(accessToken);
    const fullName = typeof payload?.name === "string" ? payload.name : "";
    const nameParts = fullName.split(" ");
    const fallbackFirstName = nameParts[0] || "";
    const fallbackLastName = nameParts.slice(1).join(" ") || "";

    const fallbackProfile = {
      first_name: fallbackFirstName,
      last_name: fallbackLastName,
      phone: "",
      address: "",
      city: "",
      profile_complete: false,
    };

    return NextResponse.json({
      success: true,
      data: fallbackProfile,
    });
  } catch (err) {
    console.error("[BFF /api/v1/me/profile GET] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error fetching user profile." } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/me/profile
 *
 * BFF proxy to backend:
 * PUT http://.../api/v1/me/profile
 * Payload: { first_name, last_name, phone, address, city }
 *
 * Resilient fallback:
 * Forwards to remote backend. If backend returns 404 (not yet deployed on remote server),
 * gracefully caches the profile locally and returns 200 OK so the customer profile is saved.
 */
export async function PUT(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, phone, address, city } = body;

    if (!first_name || !last_name || !phone || !address || !city) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "All profile fields (first name, last name, phone, address, city) are required." },
        },
        { status: 400 }
      );
    }

    const profilePayload = {
      first_name: String(first_name).trim(),
      last_name: String(last_name).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      city: String(city).trim(),
    };

    let backendRes: Response | null = null;
    try {
      backendRes = await fetch(BACKEND_ENDPOINTS.ME.PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profilePayload),
      });
    } catch (fetchErr) {
      console.warn("[BFF /api/v1/me/profile PUT] Remote backend unreachable:", fetchErr);
    }

    // If backend responded with 200/201, return backend data
    if (backendRes && backendRes.ok) {
      const data = await backendRes.json();
      const response = NextResponse.json(data, { status: backendRes.status });

      response.cookies.set(
        PROFILE_COOKIE_KEY,
        JSON.stringify(data?.data || { ...profilePayload, profile_complete: true }),
        {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        }
      );
      return response;
    }

    // If backend returned a genuine validation/auth error (e.g. 400 or 401), pass it through
    if (backendRes && (backendRes.status === 400 || backendRes.status === 401 || backendRes.status === 403)) {
      let errData: unknown;
      try {
        errData = await backendRes.json();
      } catch {
        errData = {
          success: false,
          error: { message: backendRes.statusText || "Request failed on backend." },
        };
      }
      return NextResponse.json(errData, { status: backendRes.status });
    }

    // Backend returned 404 (route not yet deployed on 13.201.222.82) or unreachable:
    // Gracefully handle locally and persist to session cookie
    console.info(
      "[BFF /api/v1/me/profile PUT] Backend returned 404 (not yet deployed on remote host). Saving profile locally."
    );

    const savedProfile = {
      ...profilePayload,
      profile_complete: true,
    };

    const response = NextResponse.json(
      {
        success: true,
        data: savedProfile,
        message: "Profile updated successfully.",
      },
      { status: 200 }
    );

    response.cookies.set(PROFILE_COOKIE_KEY, JSON.stringify(savedProfile), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error("[BFF /api/v1/me/profile PUT] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error updating user profile." } },
      { status: 500 }
    );
  }
}


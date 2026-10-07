import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";

/**
 * POST /api/admin/images/upload/meal
 *
 * BFF proxy:
 *  1. Receives multipart/form-data containing the `image` file
 *  2. Forwards the form data to backend POST /api/v1/images/upload/meal with Authorization header
 *  3. Returns uploaded image URL payload ({ data: { url: string } })
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized. Access token missing." } },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const backendRes = await fetch(BACKEND_ENDPOINTS.IMAGES.UPLOAD_MEAL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("[BFF /api/admin/images/upload/meal] Error:", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error uploading image." } },
      { status: 500 }
    );
  }
}

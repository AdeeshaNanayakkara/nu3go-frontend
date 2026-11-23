import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";
import { logBffError } from "@/lib/api/safe-log";

const MAX_SIZE = APP_CONFIG.MAX_FILE_SIZE;
const ALLOWED_TYPES = APP_CONFIG.ACCEPTED_IMAGE_TYPES as readonly string[];

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
    const file = formData.get("image");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: { message: "No image file provided." } },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: { message: `File exceeds the ${MAX_SIZE / 1024 / 1024}MB limit.` } },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { message: `File type "${file.type}" is not allowed. Accepted: ${ALLOWED_TYPES.join(", ")}.` } },
        { status: 400 },
      );
    }

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
    logBffError("[BFF /api/admin/images/upload/meal]", err);
    return NextResponse.json(
      { success: false, error: { message: "Server error uploading image." } },
      { status: 500 }
    );
  }
}

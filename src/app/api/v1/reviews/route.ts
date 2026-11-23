import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import { APP_CONFIG } from "@/constants/config";
import { logBffError } from "@/lib/api/safe-log";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/reviews — Submit a customer review
 * Body: { rating: number (1-5), comment: string (10-2000 chars), title?: string (<=120 chars) }
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Please sign in to submit a review.",
            code: "UNAUTHORIZED",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { rating, comment, title } = body || {};

    // Validate rating
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Rating must be an integer between 1 and 5." },
        },
        { status: 400 }
      );
    }

    // Validate comment
    if (typeof comment !== "string" || comment.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Review comment must be at least 10 characters." },
        },
        { status: 400 }
      );
    }

    if (comment.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Review comment cannot exceed 2,000 characters." },
        },
        { status: 400 }
      );
    }

    // Validate optional title
    if (title && (typeof title !== "string" || title.length > 120)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Review title cannot exceed 120 characters." },
        },
        { status: 400 }
      );
    }

    const payload: { rating: number; comment: string; title?: string } = {
      rating: numRating,
      comment: comment.trim(),
    };
    if (title && title.trim()) {
      payload.title = title.trim();
    }

    const backendRes = await fetch(BACKEND_ENDPOINTS.REVIEWS.CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      let friendlyMessage = data?.error?.message || data?.message;
      if (backendRes.status === 403) {
        friendlyMessage =
          friendlyMessage ||
          "Only active or past subscribers can submit reviews. Please subscribe first to share your experience.";
      } else if (backendRes.status === 409) {
        friendlyMessage =
          friendlyMessage ||
          "You have already submitted a review. Thank you for your feedback!";
      } else if (backendRes.status === 401) {
        friendlyMessage = "Your session has expired. Please sign in again.";
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: friendlyMessage || "Failed to submit review.",
            details: data?.error?.details,
          },
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: backendRes.status || 201 });
  } catch (err) {
    logBffError("[BFF /api/v1/reviews POST]", err);
    return NextResponse.json(
      { success: false, error: { message: "An unexpected error occurred while submitting your review." } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/reviews — List published public reviews or admin moderation list
 * If ?admin=true is passed, requires authentication and calls GET /reviews on backend.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    if (isAdmin) {
      const accessToken = request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;

      if (!accessToken) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Unauthorized. Access token missing." },
          },
          { status: 401 }
        );
      }

      const backendUrl = new URL(BACKEND_ENDPOINTS.REVIEWS.LIST);
      searchParams.forEach((value, key) => {
        if (key !== "admin") {
          backendUrl.searchParams.set(key, value);
        }
      });

      const backendRes = await fetch(backendUrl.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      const data = await backendRes.json().catch(() => null);
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Public list of published reviews
    const backendUrl = new URL(BACKEND_ENDPOINTS.REVIEWS.PUBLIC_LIST);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    const backendRes = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await backendRes.json().catch(() => null);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    logBffError("[BFF /api/v1/reviews GET]", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch reviews." } },
      { status: 500 }
    );
  }
}

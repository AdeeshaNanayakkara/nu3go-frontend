import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * POST /api/revalidate
 * On-demand ISR revalidation webhook (called by NestJS backend).
 */
export async function POST(request: NextRequest) {
  // TODO: Validate revalidation secret
  // TODO: Parse path/tag from request body
  // TODO: Call revalidatePath() or revalidateTag()
  return NextResponse.json({ message: "Revalidate endpoint — not implemented" }, { status: 501 });
}

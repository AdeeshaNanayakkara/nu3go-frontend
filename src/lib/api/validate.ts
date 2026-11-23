import { NextResponse } from "next/server";
import type { z } from "zod";

/**
 * Parse a request body against a Zod schema.
 * Returns the validated data on success, or a 400 NextResponse on failure.
 */
export function parseBody<T extends z.ZodTypeAny>(
  body: unknown,
  schema: T,
): { data: z.infer<T> } | { error: NextResponse } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { data: result.data };
  }

  const firstIssue = result.error.issues[0];
  const message = firstIssue
    ? `${firstIssue.path.join(".")}: ${firstIssue.message}`.replace(/^: /, "")
    : "Invalid request body.";

  return {
    error: NextResponse.json(
      { success: false, error: { message } },
      { status: 400 },
    ),
  };
}

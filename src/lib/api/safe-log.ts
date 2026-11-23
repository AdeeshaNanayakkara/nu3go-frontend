/**
 * Production-safe error logging for BFF route handlers.
 * Logs only the error message and type — never the full stack or request body.
 */
export function logBffError(tag: string, err: unknown): void {
  if (process.env.NODE_ENV === "production") {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    console.error(`${tag} ${message}`);
  } else {
    console.error(tag, err);
  }
}

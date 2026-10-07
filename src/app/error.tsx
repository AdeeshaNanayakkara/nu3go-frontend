"use client";

/**
 * Root error boundary.
 * Catches rendering errors in any route segment.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  );
}

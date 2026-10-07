"use client";

/**
 * Global error boundary.
 * Catches errors in the root layout itself.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Something went wrong!</h2>
          <p>A critical error occurred. Please try again.</p>
          <button
            onClick={reset}
            style={{ padding: "0.5rem 1.5rem", backgroundColor: "#171717", color: "#fff", borderRadius: "0.5rem", border: "none", cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}

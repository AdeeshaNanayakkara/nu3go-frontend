import Link from "next/link";

/**
 * Global 404 Not Found page.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md">
        Sorry, the page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:opacity-90"
      >
        Go Home
      </Link>
    </div>
  );
}

import Link from "next/link";

export default function ServiceNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold">Service Not Found</h2>
      <p className="text-muted-foreground">The service you are looking for does not exist.</p>
      <Link href="/services" className="text-primary underline">Browse all services</Link>
    </div>
  );
}

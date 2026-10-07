import type { Metadata } from "next";

/**
 * Search results page — SSR (SEO critical, query-based).
 */
export const metadata: Metadata = {
  title: "Search",
  description: "Search for services on Nu3Go.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  return (
    <div>
      <h1>Search Results{q ? ` for "${q}"` : ""}</h1>
      {/* TODO: Implement search results */}
    </div>
  );
}

import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { APP_CONFIG } from "@/constants/config";

/**
 * Categories listing — ISR.
 */
export const revalidate = 3600;

export const metadata: Metadata = generatePageMetadata({
  title: "Categories",
  description: "Browse services by category.",
  path: "/categories",
});

export default function CategoriesPage() {
  return (
    <div>
      <h1>Categories</h1>
      {/* TODO: Implement categories listing */}
    </div>
  );
}

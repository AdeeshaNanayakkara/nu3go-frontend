import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { APP_CONFIG } from "@/constants/config";

/**
 * Blog listing — ISR.
 */
export const revalidate = 1800;

export const metadata: Metadata = generatePageMetadata({
  title: "Blog",
  description: "Read our latest articles and insights.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <div>
      <h1>Blog</h1>
      {/* TODO: Implement blog listing */}
    </div>
  );
}

/**
 * Shared metadata helper functions.
 * Generates consistent metadata objects for pages.
 */
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageMetadataOptions {
  title: string;
  description: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
}

/**
 * Generate page metadata with consistent defaults.
 */
export function generatePageMetadata({
  title,
  description,
  image,
  path = "",
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
    ...(noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}

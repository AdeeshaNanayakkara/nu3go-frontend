/**
 * Site-wide configuration and metadata.
 * Central source of truth for site identity used across layouts, SEO, and metadata.
 */
export const siteConfig = {
  name: "Nu3Go",
  description: "Your go-to platform for finding and booking services",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/images/og-default.jpg",
  creator: "Nu3Go Team",
  keywords: [
    "services",
    "booking",
    "marketplace",
  ],
  links: {
    twitter: "",
    github: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;

import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Dynamic robots.txt generation.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/profile",
          "/payments",
          "/orders",
          "/settings",
          "/notifications",
          "/admin",
          "/api/",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

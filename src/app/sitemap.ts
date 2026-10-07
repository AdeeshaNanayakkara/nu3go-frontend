import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Dynamic sitemap generation.
 * Fetches all dynamic routes from the API and generates a sitemap.
 *
 * TODO: Fetch actual slugs from API when backend is ready.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // TODO: Fetch dynamic pages from API
  // const services = await getAllServiceSlugs();
  // const servicePages = services.map(s => ({
  //   url: `${baseUrl}/services/${s.slug}`,
  //   lastModified: new Date(s.updatedAt),
  //   changeFrequency: "weekly" as const,
  //   priority: 0.7,
  // }));

  return [...staticPages];
}

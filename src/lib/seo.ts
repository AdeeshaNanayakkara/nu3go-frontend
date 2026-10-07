/**
 * SEO helper functions.
 * Generates JSON-LD structured data for various page types.
 */
import { siteConfig } from "@/config/site";

/**
 * Generate Organization JSON-LD schema.
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.svg`,
    description: siteConfig.description,
  };
}

/**
 * Generate WebSite JSON-LD schema with SearchAction.
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate BreadcrumbList JSON-LD schema.
 */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Article JSON-LD schema (for blog posts).
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.image,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/logo.svg`,
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
  };
}

/**
 * Generate Service JSON-LD schema.
 */
export function generateServiceSchema(service: {
  name: string;
  description: string;
  url: string;
  image: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: service.url,
    image: service.image,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      price: service.price,
      priceCurrency: service.currency,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: service.rating,
      reviewCount: service.reviewCount,
    },
  };
}

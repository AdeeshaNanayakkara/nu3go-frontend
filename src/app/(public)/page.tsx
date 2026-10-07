import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/lib/seo";
import { HeroSection } from "@/components/home/hero-section";
import { FeatureHighlights } from "@/components/home/feature-highlights";
import { HowItWorks } from "@/components/home/how-it-works";
import { MenuShowcase } from "@/components/home/menu-showcase";
import { DeliveryLocations } from "@/components/home/delivery-locations";
import { ContactSection } from "@/components/home/contact-section";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { HighlightSection } from "@/components/home/highlight-section";

export const metadata: Metadata = generatePageMetadata({
  title: "nu3go — Healthy Inside, Fresh Outside",
  description: "Fresh, nutritionally balanced chef-crafted meals delivered directly to your doorstep.",
  path: "/",
});

export default function HomePage() {
  const websiteSchema = generateWebsiteSchema();
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />

      {/* ─── Pizzeria-style Hero Section & Overlapping Dish ─── */}
      <HeroSection />

      {/* ─── 3-Column Feature Highlights ─── */}
      <FeatureHighlights />

      {/* ─── Pizzeria-style How It Works Banner ─── */}
      <HowItWorks />

      {/* ─── Pizzeria-style Menu Categories Showcase ─── */}
      <MenuShowcase />

      {/* ─── Pizzeria-style Delivery Locations ─── */}
      <DeliveryLocations />

      {/* ─── Contact Section ─── */}
      <ContactSection />

      {/* ─── Instagram Mosaic Gallery & Ratings Banner ─── */}
      <InstagramGallery />

      {/* ─── Sri Lanka's First-Ever Subscription Highlight Section ─── */}
      <HighlightSection />
    </>
  );
}



import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { AboutHero } from "@/components/about/about-hero";
import { AboutStory } from "@/components/about/about-story";
import { AboutExcellence } from "@/components/about/about-excellence";
import { AboutProcess } from "@/components/about/about-process";
import { AboutPartnership } from "@/components/about/about-partnership";

/**
 * About page — Nu3Go Culinary Nutrition Story & Mission.
 */
export const metadata: Metadata = generatePageMetadata({
  title: "About Us — Nu3Go",
  description: "Learn about Nu3Go's mission, chef craftsmanship, macro-precision nutrition, and state-of-the-art kitchen facility.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="w-full bg-[#F7F6F2]">
      {/* 1. Hero Section with curved bottom divider */}
      <AboutHero />

      {/* 2. Our Story Section (Astra Pizzeria 2-Col layout with Founder Card) */}
      <AboutStory />

      {/* 3. Culinary Excellence / Kitchen Facility Section */}
      <AboutExcellence />

      {/* 4. Authentic Recipes & Scientific Macro Roots Section */}
      <AboutProcess />

      {/* 5. Corporate Partnership & Expansion Opportunities Section */}
      <AboutPartnership />
    </div>
  );
}


import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { AboutHero } from "@/components/about/about-hero";
import { StoryGenesis } from "@/components/about/story-genesis";
import { StoryPhilosophy } from "@/components/about/story-philosophy";
import { StoryJourney } from "@/components/about/story-journey";
import { StorySanctuary } from "@/components/about/story-sanctuary";
import { StoryPartnership } from "@/components/about/story-partnership";
import { StoryCta } from "@/components/about/story-cta";

/**
 * About page — nu3go Story, Mission, Policies & Partnerships.
 */
export const metadata: Metadata = generatePageMetadata({
  title: "About Us — nu3go | Building Sri Lanka's #1 Meal Subscription Service",
  description:
    "nu3go is building Sri Lanka's #1 meal subscription service. Fresh, healthy, and convenient everyday meals delivered with 100% free delivery across Colombo and Wattala, Monday to Friday.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="w-full bg-[#F7F6F2]">
      {/* ─── Hero Section: Good Food. Better Days. ─── */}
      <AboutHero />

      {/* ─── Our Purpose: The Workday Meal Struggle & nu3go Promise ─── */}
      <StoryGenesis />

      {/* ─── Mechanism: Rotating Healthy Menu, Flexible Routines & Swaps, Curated Meal Plans ─── */}
      <StoryPhilosophy />

      {/* ─── How nu3go Works: From Fresh Ingredients To Your Doorstep ─── */}
      <StoryJourney />

      {/* ─── Terms & Conditions: Delivery Schedule & Service Policies ─── */}
      <StorySanctuary />

      {/* ─── Partnership & Corporate Wellness ─── */}
      <StoryPartnership />

      {/* ─── Epilogue: Meal Subscriptions CTA ─── */}
      <StoryCta />
    </div>
  );
}

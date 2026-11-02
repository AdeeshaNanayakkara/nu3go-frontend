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
 * About page — nu3go Story, Mission & Partnerships.
 */
export const metadata: Metadata = generatePageMetadata({
  title: "About Us — nu3go | Building Sri Lanka's #1 Breakfast Subscription Service",
  description:
    "nu3go is building Sri Lanka's #1 breakfast subscription service. Fresh, nutritional, ready-to-eat breakfasts delivered with 100% free delivery across Colombo and Wattala by 7:30 AM every weekday morning.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="w-full bg-[#F7F6F2]">
      {/* ─── Hero Section (Preserved Exactly As-Is) ─── */}
      <AboutHero />

      {/* ─── Our Purpose: Colombo's Morning Dilemma & Founder's Vision ─── */}
      <StoryGenesis />

      {/* ─── How It Works: Rotating Menu, Meal Swaps & 100% Free Delivery ─── */}
      <StoryPhilosophy />

      {/* ─── Dawn to Doorstep: 3:30 AM to 7:30 AM Delivery Timeline ─── */}
      <StoryJourney />

      {/* ─── Kitchen Standards: 5,000+ Sq Ft Kitchen & Zero-Compromise Standards ─── */}
      <StorySanctuary />

      {/* ─── Partnership & Corporate Wellness ─── */}
      <StoryPartnership />

      {/* ─── Epilogue: Breakfast Subscriptions CTA ─── */}
      <StoryCta />
    </div>
  );
}

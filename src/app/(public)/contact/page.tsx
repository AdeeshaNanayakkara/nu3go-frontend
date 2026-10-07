import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactFaqSection } from "@/components/contact/contact-faq-section";
import { ContactCardSection } from "@/components/contact/contact-card-section";

/**
 * Contact page — Interactive contact hero, FAQs, and inquiry form.
 */
export const metadata: Metadata = generatePageMetadata({
  title: "Contact Us — Nu3Go",
  description: "Get in touch with the Nu3Go nutrition, meal subscription, and wellness team. Browse common questions and FAQs.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="w-full bg-[#F7F6F2]">
      {/* ─── Pizzeria-style Contact Hero Section ─── */}
      <ContactHero />

      {/* ─── Frequently Asked Questions Section (Above Inquiry Form) ─── */}
      <ContactFaqSection />

      {/* ─── Interactive Contact Cards & Mail Inquiry Form ─── */}
      <ContactCardSection />
    </div>
  );
}


import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { ContactFaqSection } from "@/components/contact/contact-faq-section";
import Link from "next/link";
import { HelpCircle, ArrowRight, PhoneCall } from "lucide-react";

/**
 * FAQ page — Dynamic FAQ listings fetched from /public/faqs
 */
export const metadata: Metadata = generatePageMetadata({
  title: "Frequently Asked Questions — Nu3Go",
  description: "Browse frequently asked questions regarding our chef-crafted meal subscriptions, macro nutrition, packaging, and Colombo delivery zones.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="w-full bg-[#F7F6F2] min-h-screen">
      {/* ─── FAQ Hero Banner ─── */}
      <section className="relative w-full bg-[#0B3B17] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden text-white">
        <div className="absolute inset-0 bg-[radial-gradient(#36D068_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#36D068]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1240px] mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#36D068]/20 border border-[#36D068]/40 px-4 py-1.5 rounded-full text-[#36D068] font-oswald text-xs font-bold uppercase tracking-widest mb-4">
            <HelpCircle className="w-4 h-4 text-[#36D068]" />
            <span>HELP &amp; KNOWLEDGE BASE</span>
          </div>

          <h1 className="font-oswald text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            FREQUENTLY ASKED QUESTIONS
          </h1>

          <p className="text-emerald-200/90 text-sm sm:text-base max-w-2xl mx-auto mt-4 font-medium leading-relaxed">
            Everything you need to know about our subscriptions, daily fresh deliveries, macro nutrition, and cancellation policies in one place.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/plans"
              className="inline-flex items-center gap-2 bg-[#36D068] hover:bg-[#2eb95c] text-[#0B3B17] font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-transform duration-200 hover:scale-105"
            >
              <span>EXPLORE MEAL PLANS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-[#36D068]" />
              <span>CONTACT SUPPORT</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Dynamic FAQ Section (Fetches via /public/faqs API) ─── */}
      <ContactFaqSection />
    </div>
  );
}

import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { TermsHero } from "@/components/terms/terms-hero";
import { TermsContent } from "@/components/terms/terms-content";

export const metadata: Metadata = generatePageMetadata({
  title: "Terms & Conditions — Nu3Go",
  description:
    "Official terms & conditions for nu3go weekday meal subscription service. Review our delivery schedule, cancellation cutoffs, wallet credits, and customer responsibilities.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="w-full bg-[#FAF9F5] min-h-screen">
      <TermsHero />
      <TermsContent />
    </div>
  );
}

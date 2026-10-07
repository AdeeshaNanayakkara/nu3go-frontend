import type { Metadata } from "next";
import { Suspense } from "react";
import { generatePageMetadata } from "@/lib/metadata";
import { PlansHero } from "@/components/plans/plans-hero";
import { PlanCardsSection } from "@/components/plans/plan-cards-section";
import { PlanPower } from "@/components/plans/plan-power";
import { PlanClassic } from "@/components/plans/plan-classic";
import { PlanIskool } from "@/components/plans/plan-iskool";
import { PlanFourtig } from "@/components/plans/plan-fourtig";
import { matchPackageByName } from "@/components/plans/plan-utils";
import { BACKEND_ENDPOINTS } from "@/services/api/backend";
import type { PublicPackage } from "@/services/api/package.service";

export const metadata: Metadata = generatePageMetadata({
  title: "Meal Plans — Nu3Go",
  description: "Explore our 4 chef-crafted meal plans (Power, Classic, Iskool, Fourtig) and flexible subscription durations.",
  path: "/plans",
});

/**
 * Server-side fetch of active catalog packages from database
 */
async function getActivePackages(): Promise<PublicPackage[]> {
  try {
    const res = await fetch(BACKEND_ENDPOINTS.PUBLIC_PACKAGES.LIST, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const json = await res.json();
      const list = json?.data?.data || json?.data;
      if (Array.isArray(list)) return list;
    }
  } catch (err) {
    console.warn("[PlansPage] Error pre-fetching public packages:", err);
  }

  return [];
}

export default async function PlansPage() {
  const packages = await getActivePackages();

  // Match packages dynamically by name
  const powerPkg = matchPackageByName(packages, "Power");
  const classicPkg = matchPackageByName(packages, "Classic");
  const iskoolPkg = matchPackageByName(packages, "Iskool");
  const fourtigPkg = matchPackageByName(packages, "Fourtig");

  return (
    <div className="w-full bg-[#F7F6F2]">
      {/* ─── 1. Pizzeria-style Plans Hero Section ─── */}
      <PlansHero />

      {/* ─── 2. 3-Card Subscription Duration Packages (Monthly, Weekly, Hybrid) ─── */}
      <PlanCardsSection />

      <Suspense fallback={null}>
        {/* ─── 3. Dedicated POWER Plan Section (Athletic High-Protein) ─── */}
        <PlanPower packageData={powerPkg} />

        {/* ─── 4. Dedicated CLASSIC Plan Section (Balanced Daily Wellness) ─── */}
        <PlanClassic packageData={classicPkg} />

        {/* ─── 5. Dedicated ISKOOL Plan Section (Growing Kids & Student Focus) ─── */}
        <PlanIskool packageData={iskoolPkg} />

        {/* ─── 6. Dedicated FOURTIG Plan Section (40+ Longevity & Vitality) ─── */}
        <PlanFourtig packageData={fourtigPkg} />
      </Suspense>
    </div>
  );
}

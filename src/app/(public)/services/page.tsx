import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { MenuHero } from "@/components/menu/menu-hero";
import { MenuSection } from "@/components/menu/menu-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = generatePageMetadata({
  title: "Our Menu — Nu3Go",
  description: "Explore our 4 chef-curated meal packages (Power, Classic, Iskool, Fourtig) made with fresh organic ingredients and premium proteins.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="w-full bg-[#F7F6F2] min-h-screen">
      {/* ─── Pizzeria-style Menu Hero Section ─── */}
      <MenuHero />

      {/* ─── Interactive Menu Section with 4 Packages & Menu 1/2/3 ─── */}
      <MenuSection />
    </div>
  );
}



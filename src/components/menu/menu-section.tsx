"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Flame, 
  Leaf, 
  Sparkles,
  Zap,
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Compass,
  Loader2
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  WEEKLY_MENUS, 
  PACKAGE_CONFIGS, 
  parseApiPackageMenus,
  type WeeklyMenuData, 
  type DailyMenuItem,
  type PackageTierKey,
  type MealDetail 
} from "./menu-data";
import { packageService, type PublicPackage } from "@/services/api/package.service";
import { matchPackageByName } from "@/components/plans/plan-utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PACKAGE_KEYS: PackageTierKey[] = ["POWER", "CLASSIC", "ISKOOL", "FOURTIG"];

function MenuSectionContent() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardGridRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  // Active Package Tier: 'POWER' | 'CLASSIC' | 'ISKOOL' | 'FOURTIG'
  const [selectedTier, setSelectedTier] = useState<PackageTierKey>("POWER");

  // Active Menu index: 0 (Menu 1), 1 (Menu 2), 2 (Menu 3)
  const [activeMenuIndex, setActiveMenuIndex] = useState<number>(0);

  // Dynamic API state
  const [publicPackages, setPublicPackages] = useState<PublicPackage[]>([]);
  const [packageDetailsCache, setPackageDetailsCache] = useState<Record<string, PublicPackage>>({});
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // 1. Initial load: Fetch all public packages & prefetch their details
  useEffect(() => {
    let isMounted = true;
    async function loadPackages() {
      try {
        const pkgs = await packageService.getPublicPackages();
        if (isMounted && pkgs && pkgs.length > 0) {
          setPublicPackages(pkgs);

          // Eagerly prefetch details (/public/packages/{id}) for each package in parallel
          pkgs.forEach(async (pkg) => {
            if (pkg.id) {
              try {
                const detail = await packageService.getPublicPackageDetail(pkg.id);
                if (isMounted && detail) {
                  setPackageDetailsCache((prev) => ({ ...prev, [pkg.id]: detail }));
                }
              } catch (detailErr) {
                console.warn(`Could not prefetch detail for package ${pkg.id}:`, detailErr);
              }
            }
          });
        }
      } catch (err) {
        console.warn("Could not load public packages for menu:", err);
      }
    }
    loadPackages();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to searchParams (e.g., ?package=classic, ?plan=power, ?tier=iskool, ?subscribe=fourtig)
  useEffect(() => {
    const pkgParam =
      searchParams?.get("package") ||
      searchParams?.get("plan") ||
      searchParams?.get("tier") ||
      searchParams?.get("subscribe") ||
      searchParams?.get("category");

    if (pkgParam) {
      const lower = pkgParam.toLowerCase();
      if (lower.includes("power")) setSelectedTier("POWER");
      else if (lower.includes("classic")) setSelectedTier("CLASSIC");
      else if (lower.includes("iskool") || lower.includes("school") || lower.includes("kid")) setSelectedTier("ISKOOL");
      else if (lower.includes("fourtig") || lower.includes("40") || lower.includes("4tig")) setSelectedTier("FOURTIG");
      else if (publicPackages.length > 0) {
        const match = publicPackages.find((p) => p.id === pkgParam);
        if (match) {
          const mLower = match.name.toLowerCase();
          if (mLower.includes("power")) setSelectedTier("POWER");
          else if (mLower.includes("classic")) setSelectedTier("CLASSIC");
          else if (mLower.includes("iskool")) setSelectedTier("ISKOOL");
          else if (mLower.includes("fourtig") || mLower.includes("40")) setSelectedTier("FOURTIG");
        }
      }

      // Smooth scroll into menu catalog view if navigating with plan/package param
      setTimeout(() => {
        const element = document.getElementById("menu-catalog");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [searchParams, publicPackages]);

  // 2. Find matched backend package for currently selected tier
  const matchedPackage = matchPackageByName(publicPackages, selectedTier);

  // 3. Fetch package details via GET /public/packages/{id} when tier changes (if not already cached)
  const fetchPackageDetail = useCallback(async (pkgId: string) => {
    if (packageDetailsCache[pkgId]) return; // Already cached

    setIsLoadingDetail(true);
    try {
      const detail = await packageService.getPublicPackageDetail(pkgId);
      if (detail) {
        setPackageDetailsCache((prev) => ({ ...prev, [pkgId]: detail }));
      }
    } catch (err) {
      console.warn(`Failed to fetch /public/packages/${pkgId}:`, err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [packageDetailsCache]);

  useEffect(() => {
    if (matchedPackage?.id && !packageDetailsCache[matchedPackage.id]) {
      fetchPackageDetail(matchedPackage.id);
    }
  }, [matchedPackage?.id, fetchPackageDetail, packageDetailsCache]);

  // Active package details (from API if loaded, otherwise matched package)
  const activePackageDetail = matchedPackage?.id
    ? packageDetailsCache[matchedPackage.id] || matchedPackage
    : null;

  // Derive weekly menus dynamically from package details (or fallback to curated dataset)
  const dynamicWeeklyMenus: WeeklyMenuData[] = activePackageDetail?.menus && activePackageDetail.menus.length > 0
    ? parseApiPackageMenus(activePackageDetail.menus, selectedTier)
    : parseApiPackageMenus(null, selectedTier);

  const safeMenuIndex = activeMenuIndex >= dynamicWeeklyMenus.length ? 0 : activeMenuIndex;
  const currentMenu: WeeklyMenuData = dynamicWeeklyMenus[safeMenuIndex] || dynamicWeeklyMenus[0] || WEEKLY_MENUS[0];
  const activePackage = PACKAGE_CONFIGS[selectedTier];

  const handlePrevMenu = () => {
    setActiveMenuIndex((prev) => (prev === 0 ? dynamicWeeklyMenus.length - 1 : prev - 1));
  };

  const handleNextMenu = () => {
    setActiveMenuIndex((prev) => (prev === dynamicWeeklyMenus.length - 1 ? 0 : prev + 1));
  };

  // Helper to extract the meal for active package tier
  const getMealForDay = (day: DailyMenuItem): MealDetail => {
    if (day.meal) return day.meal;
    switch (selectedTier) {
      case "POWER":
        return day.powerMeal;
      case "CLASSIC":
        return day.classicMeal;
      case "ISKOOL":
        return day.iskoolMeal;
      case "FOURTIG":
        return day.fourtigMeal;
      default:
        return day.powerMeal;
    }
  };

  // Animate dish cards when menu or tier changes
  useEffect(() => {
    if (!cardGridRef.current) return;
    gsap.fromTo(
      cardGridRef.current.children,
      { opacity: 0, y: 16, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
    );
  }, [safeMenuIndex, selectedTier, isLoadingDetail]);

  // Render Icon according to tier config
  const renderTierIcon = (tierKey: PackageTierKey, className = "w-4 h-4") => {
    switch (tierKey) {
      case "POWER":
        return <Flame className={className} />;
      case "CLASSIC":
        return <Leaf className={className} />;
      case "ISKOOL":
        return <Sparkles className={className} />;
      case "FOURTIG":
        return <Zap className={className} />;
    }
  };

  return (
    <section
      ref={sectionRef}
      id="menu-catalog"
      className="relative w-full pb-24 sm:pb-32 -mt-14 sm:-mt-20 lg:-mt-24 z-30 overflow-visible select-none font-poppins scroll-mt-24"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-30 space-y-8">
        
        {/* ══════════════════════════════════════════════════════════
            1. 4-PACKAGE FLOATING TABS SELECTOR (POWER | CLASSIC | ISKOOL | fourtiG)
           ══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center justify-center">
          <div className="bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl sm:rounded-full shadow-2xl border border-slate-200/90 flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 sm:gap-2 max-w-4xl w-full ring-4 ring-black/5">
            {PACKAGE_KEYS.map((key) => {
              const pkg = PACKAGE_CONFIGS[key];
              const isSelected = selectedTier === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedTier(key);
                    setActiveMenuIndex(0);
                  }}
                  className={`flex-1 min-w-[140px] sm:min-w-0 flex items-center justify-center gap-2 py-3 px-3 sm:px-5 rounded-xl sm:rounded-full font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                    isSelected
                      ? `${pkg.activeTabClass} scale-[1.03]`
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  {renderTierIcon(key, `w-4 h-4 shrink-0 ${isSelected ? "" : "text-slate-500"}`)}
                  <span className="truncate">{pkg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Package Dynamic Description & Target Highlight Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-medium text-slate-700 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl sm:rounded-full border border-slate-200/80 shadow-md">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full font-oswald text-xs font-black uppercase tracking-wider ${activePackage.badgeClass}`}>
                {activePackage.badge}
              </span>
              <span className="font-semibold text-neutral-900">
                {activePackageDetail?.description || activePackage.description}
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200 text-xs text-slate-500">
              <span className="font-oswald font-bold text-neutral-900 bg-slate-100 px-2 py-0.5 rounded-md">
                ⚡ {activePackage.targetProtein}
              </span>
              <span className="font-oswald font-bold text-neutral-900 bg-slate-100 px-2 py-0.5 rounded-md">
                🔥 {activePackage.targetCalories}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2. MAIN MENU CARD CONTAINER (Pizzeria Signature Layout)
           ══════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden relative">
          
          {/* ─── Top Bar: Dynamic Package Gradient Header with Menu Navigation ─── */}
          <div className="bg-[#0B3B17] px-6 sm:px-8 py-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
            {/* Subtle glow accent */}
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left / Center: Menu Carousel Switcher */}
            <div className="flex items-center gap-4 z-10">
              <button
                onClick={handlePrevMenu}
                disabled={dynamicWeeklyMenus.length <= 1}
                aria-label="Previous Menu"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 border border-white/15 cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h2 className="font-oswald text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider text-white">
                    {currentMenu.menuNumber}
                  </h2>
                  <span className={`font-oswald text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm bg-gradient-to-r ${activePackage.gradient} ${selectedTier === "CLASSIC" || selectedTier === "FOURTIG" ? "text-slate-950" : "text-white"}`}>
                    {activePackage.label} ROTATION
                  </span>
                  <span className="bg-white/20 text-white font-oswald text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {currentMenu.schedule}
                  </span>
                  {isLoadingDetail && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-medium animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Updating menu...
                    </span>
                  )}
                </div>
                <p className="text-emerald-100/90 text-xs sm:text-sm font-medium mt-1 max-w-xl">
                  {currentMenu.description}
                </p>
              </div>

              <button
                onClick={handleNextMenu}
                disabled={dynamicWeeklyMenus.length <= 1}
                aria-label="Next Menu"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 border border-white/15 cursor-pointer shrink-0"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Direct Subscribe Button */}
            <div className="flex items-center gap-3 z-10 shrink-0">
              <Link
                href={`/plans?subscribe=${activePackage.subscribePlanParam}${matchedPackage?.id ? `&package=${matchedPackage.id}` : ""}`}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-oswald text-xs font-black uppercase tracking-wider shadow-md transition-transform hover:scale-105 active:scale-95 bg-gradient-to-r ${activePackage.gradient} ${selectedTier === "CLASSIC" || selectedTier === "FOURTIG" ? "text-slate-950" : "text-white"}`}
              >
                <span>Subscribe {activePackage.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* ─── 3. Menu Content Display: 5-Day Card Grid ─── */}
          <div className="p-6 sm:p-8 lg:p-10 bg-[#FAF9F5]">
            <div
              ref={cardGridRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6"
            >
              {currentMenu.days.map((day) => {
                const meal = getMealForDay(day);

                return (
                  <div
                    key={day.dayKey}
                    className="group bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top Accent Stripe matching active package gradient */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${activePackage.gradient}`} />

                    <div>
                      {/* Day / Date Tag */}
                      <div className="flex items-center justify-between mb-3 pt-1">
                        <span className="font-oswald text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-neutral-900 text-white shadow-2xs">
                          {day.dayTitle}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 capitalize font-poppins">
                          {day.daySubtitle}
                        </span>
                      </div>

                      {/* Dish Photo Container */}
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-100 shadow-inner group-hover:shadow-md transition-shadow">
                        <Image
                          src={meal.image || activePackage.dishImage || "/images/power1.png"}
                          alt={meal.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>

                      {/* Dish Name */}
                      <h3 className="font-oswald text-base sm:text-lg font-black uppercase text-neutral-900 tracking-tight leading-tight mb-2 group-hover:text-emerald-700 transition-colors">
                        {meal.name}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 text-xs leading-relaxed font-normal">
                        {meal.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── 4. Bottom Menu Actions & 4-Package Cards Strip ─── */}
          <div className="p-6 sm:p-8 bg-white border-t border-slate-100">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              
              <div className="space-y-1 text-center lg:text-left">
                <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-500">
                  Daily Delivery Schedule
                </span>
                <h4 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900 tracking-tight">
                  Ready to Start Your Clean Nutrition Habit?
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-normal">
                  Subscribe to any of our 4 meal packages. Flexible weekday morning delivery straight to your doorstep across Colombo and suburbs.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <Link
                  href="/plans"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  <Compass className="w-4 h-4 text-[#36D068]" />
                  <span>View All 4 Subscription Plans</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={`/plans?subscribe=${activePackage.subscribePlanParam}${matchedPackage?.id ? `&package=${matchedPackage.id}` : ""}`}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 bg-gradient-to-r ${activePackage.gradient} ${selectedTier === "CLASSIC" || selectedTier === "FOURTIG" ? "text-slate-950" : "text-white"}`}
                >
                  <span>Subscribe to {activePackage.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 4 Package Quick Cards Mini Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100">
              {PACKAGE_KEYS.map((key) => {
                const pkg = PACKAGE_CONFIGS[key];
                const isSelected = selectedTier === key;
                return (
                  <div
                    key={key}
                    onClick={() => {
                      setSelectedTier(key);
                      setActiveMenuIndex(0);
                    }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 ${
                      isSelected
                        ? `bg-slate-50 ${pkg.activeBorderClass} shadow-md ring-2 ring-black/5`
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${pkg.gradient}`} />
                        <h5 className="font-oswald text-sm font-bold uppercase text-neutral-900 tracking-tight">
                          {pkg.label}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {pkg.targetProtein} • {pkg.targetCalories}
                      </p>
                    </div>

                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <Image
                        src={pkg.dishImage}
                        alt={pkg.label}
                        fill
                        className="object-contain"
                        sizes="48px"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export function MenuSection() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1360px] mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <MenuSectionContent />
    </Suspense>
  );
}

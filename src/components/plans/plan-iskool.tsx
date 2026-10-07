"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Flame,
  Zap,
  Activity,
  Heart,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Utensils,
  Award,
  Smile,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuthStore } from "@/store/auth.store";
import { SubscribeModal } from "@/components/subscription/subscribe-modal";
import { cn } from "@/lib/utils";
import type { PublicPackage } from "@/services/api/package.service";
import {
  mapPackagePlansToDurations,
  matchPackageByName,
  getPackageDiscount,
  calculateDiscountedPrice,
  type DurationPriceOption,
} from "./plan-utils";
import { DiscountBadge } from "./discount-badge";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ISKOOL_DURATIONS: DurationPriceOption[] = [
  {
    key: "monthly",
    label: "MONTHLY",
    subLabel: "20 Weekdays",
    days: 20,
    price: 9500,
    unit: "per month",
    badge: "BEST VALUE",
    description: "20 Kid-Approved Student Breakfast Meals • Monday to Friday delivery",
    rules: [
      "Doorstep delivery",
      "A consistent daily routine",
      "Subscription confirmation before 5:00 PM previous day",
      "Missed meals added to credit",
    ],
    planType: "FIXED",
    durationLimit: 20,
  },
  {
    key: "weekly",
    label: "WEEKLY",
    subLabel: "5 Days",
    days: 5,
    price: 2350,
    unit: "per week",
    description: "5 Kid-Approved Breakfast Meals • Monday to Friday morning delivery",
    rules: [
      "Doorstep delivery",
      "Try us before committing",
      "Renewal confirmation Sundays 5:00 PM and Wednesdays 5:00 PM",
      "Missed meals added to credit",
    ],
    planType: "FIXED",
    durationLimit: 5,
  },
  {
    key: "hybrid",
    label: "HYBRID FUEL",
    subLabel: "12 Days",
    days: 12,
    price: 6360,
    unit: "per 12 days",
    description: "12 Flexible Student Breakfast Meals • Custom routine valid for 30 days",
    rules: [
      "Doorstep delivery",
      "Designed for hybrid workers",
      "Subscription confirmation before 5:00 PM previous day",
      "Confirm your delivery previous day before 5:00 PM",
    ],
    planType: "CUSTOM",
    durationLimit: 12,
  },
];

interface PlanIskoolProps {
  packageData?: PublicPackage | null;
}

export function PlanIskool({ packageData }: PlanIskoolProps = {}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [pkg, setPkg] = useState<PublicPackage | null>(packageData || null);

  // Client-side fallback fetch if not provided via props
  useEffect(() => {
    if (packageData) {
      setPkg(packageData);
      return;
    }
    async function loadIskoolPackage() {
      try {
        const res = await fetch("/api/public/packages");
        if (res.ok) {
          const json = await res.json();
          const list = json?.data?.data || json?.data;
          const matched = matchPackageByName(list, "Iskool");
          if (matched) setPkg(matched);
        }
      } catch (err) {
        console.warn("Could not load dynamic Iskool package:", err);
      }
    }
    loadIskoolPackage();
  }, [packageData]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  // Map dynamic assigned plans from DB (or fallback to static options)
  const durations = useMemo(() => {
    return mapPackagePlansToDurations(
      pkg,
      ISKOOL_DURATIONS,
      "Kid-Approved Student Breakfast Meals • Monday to Friday delivery"
    );
  }, [pkg]);

  const [selectedDurationKey, setSelectedDurationKey] = useState<string>(
    durations[0]?.key || "monthly"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Synchronize selected key if durations change
  useEffect(() => {
    if (durations.length > 0 && !durations.some((d) => d.key === selectedDurationKey)) {
      setSelectedDurationKey(durations[0].key);
    }
  }, [durations, selectedDurationKey]);

  // Check if returning with query params or hash for this package
  useEffect(() => {
    const pkgTarget =
      searchParams.get("package") ||
      searchParams.get("subscribe") ||
      searchParams.get("tier") ||
      searchParams.get("plan");
    const durationParam = searchParams.get("duration");

    const isMatch =
      (pkgTarget &&
        (pkgTarget.toLowerCase() === "iskool" ||
          pkgTarget.toLowerCase().includes("school") ||
          pkgTarget.toLowerCase().includes("kid") ||
          pkgTarget.toLowerCase() === pkg?.name?.toLowerCase() ||
          pkgTarget === pkg?.id)) ||
      (typeof window !== "undefined" &&
        (window.location.hash === "#plan-iskool" || window.location.hash === "#iskool"));

    if (isMatch) {
      if (durationParam && durations.some((d) => d.key === durationParam)) {
        setSelectedDurationKey(durationParam);
      }
      if (user && searchParams.get("subscribe")) {
        setIsModalOpen(true);
      }
      setTimeout(() => {
        document.getElementById("plan-iskool")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 250);
    }
  }, [searchParams, user, pkg, durations]);

  const activeDuration =
    durations.find((d) => d.key === selectedDurationKey) ||
    durations[0] ||
    ISKOOL_DURATIONS[0];

  // Extract active package discount (if assigned)
  const discount = useMemo(() => getPackageDiscount(pkg), [pkg]);
  const discountedPrice = discount
    ? calculateDiscountedPrice(activeDuration.price, discount.percentage)
    : activeDuration.price;

  const handleSubscribeClick = () => {
    if (!user) {
      const returnUrl = `/plans?subscribe=iskool&duration=${encodeURIComponent(selectedDurationKey)}#plan-iskool`;
      router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ─── Image entrance from Left ───
      if (imageContainerRef.current) {
        gsap.fromTo(
          imageContainerRef.current,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out",
            clearProps: "opacity,transform",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }

      // ─── Content entrance from Right with Staggered Children ───
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "opacity,transform",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="plan-iskool"
      className="relative w-full bg-[#09111E] text-white overflow-hidden select-none border-t border-white/5"
    >
      {/* ─── Ambient Glow Gradients ─── */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#36D068]/15 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ─── Full-Bleed 2-Column Split Grid ─── */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-stretch relative z-10 min-h-[680px] lg:min-h-[760px]">
        {/* ══════════════════════════════════════════════════════════
            LEFT: FULL COVER IMAGE (Bleeds 100% to the left edge)
           ══════════════════════════════════════════════════════════ */}
        <div
          ref={imageContainerRef}
          className="lg:col-span-6 relative w-full h-[420px] sm:h-[520px] lg:h-auto min-h-[420px] lg:min-h-full overflow-hidden will-change-[transform,opacity] group"
        >
          <Image
            src="/images/plans/iskool-plan.jpg"
            alt="Nu3Go Iskool Meal Plan - Healthy Kid Approved Breakfast"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Edge Blend & Readability Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09111E] via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-[#09111E]" />

          {/* Floating Top Badge */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/75 backdrop-blur-md border border-cyan-400/40 shadow-xl">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span className="font-oswald text-xs sm:text-sm font-bold tracking-widest uppercase text-cyan-400">
              STUDENT &amp; YOUTH VITALITY
            </span>
          </div>

          {/* Floating Bottom Callout */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-20 flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-white/15 shadow-2xl max-w-md">
            <div>
              <div className="font-oswald text-xs uppercase tracking-wider text-neutral-400">
                BRAIN &amp; GROWTH FORMULATION
              </div>
              <div className="font-oswald text-lg sm:text-xl font-black text-cyan-400">
                DHA Omega-3 • Iron • Calcium
              </div>
            </div>
            <div className="w-11 h-11 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <Smile className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RIGHT: DEEP PLAN DETAILS & DURATION PRICING (Container)
           ══════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 flex items-center justify-start py-12 sm:py-16 lg:py-20 px-6 sm:px-10 lg:px-12 xl:px-16 2xl:px-20">
          <div
            ref={contentRef}
            className="w-full max-w-xl flex flex-col items-start space-y-6 will-change-[transform,opacity]"
          >
            {/* Tagline Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-oswald text-xs font-bold tracking-widest uppercase text-cyan-400">
                PLAN 03 • GROWING MINDS &amp; BODIES
              </span>
            </div>

            {/* Main Heading & Explore Menu Button (Side-by-Side) */}
            <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-oswald text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase text-white tracking-tight leading-[1.08]">
                  ISKOOL <span className="text-cyan-400">MEAL PLAN</span>
                </h2>
                <p className="text-neutral-300 text-xs sm:text-sm font-light mt-1">
                  Kid-Approved Nutrition to Power Classroom &amp; Sports Focus
                </p>
              </div>

              {/* Explore Menu Button in Box */}
              <Link
                href="/services?plan=iskool#menu-catalog"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 hover:text-white font-oswald text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-lg hover:shadow-cyan-500/30 shrink-0 group self-start sm:self-center"
              >
                <Utensils className="w-4 h-4 text-cyan-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            {/* Ideal Persona Pill */}
            <div className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <Award className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-xs sm:text-sm text-neutral-300">
                <span className="font-semibold text-white">Ideal For: </span>
                School Children, Teenagers, Young Athletes &amp; Students
              </div>
            </div>

            {/* ─── 4-Card Macro Dashboard ─── */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Calories */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1 text-xs text-orange-400 font-semibold mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Energy</span>
                </div>
                <span className="font-oswald text-base sm:text-lg font-bold text-white">
                  350 - 450
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">kcal / meal</span>
              </div>

              {/* Protein */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Growth Protein</span>
                </div>
                <span className="font-oswald text-base sm:text-lg font-bold text-cyan-400">
                  15g - 22g
                </span>
                <span className="text-[10px] text-cyan-400/80 uppercase tracking-wider">Clean Growth</span>
              </div>

              {/* Carbs */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1 text-xs text-sky-400 font-semibold mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Brain Carbs</span>
                </div>
                <span className="font-oswald text-base sm:text-lg font-bold text-white">
                  45g - 55g
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Whole Grains</span>
              </div>

              {/* Fats */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold mb-1">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Brain Fats</span>
                </div>
                <span className="font-oswald text-base sm:text-lg font-bold text-white">
                  8g - 12g
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">DHA &amp; Seeds</span>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                ✨ DEDICATED DURATION PRICING SELECTOR FOR ISKOOL PLAN
               ══════════════════════════════════════════════════════════ */}
            <div className="w-full p-5 rounded-3xl bg-neutral-900/90 border border-cyan-400/30 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-oswald text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  SELECT ISKOOL SUBSCRIPTION DURATION
                </span>
                <span className="text-[11px] font-oswald text-cyan-400 font-bold uppercase">
                  {activeDuration.days} MEALS INCLUDED
                </span>
              </div>

              {/* Dynamic Duration Toggle Buttons */}
              <div
                className={cn(
                  "grid gap-2 p-1.5 rounded-2xl bg-neutral-950 border border-white/10",
                  durations.length === 1 && "grid-cols-1",
                  durations.length === 2 && "grid-cols-2",
                  durations.length === 3 && "grid-cols-3",
                  durations.length >= 4 && "grid-cols-2 sm:grid-cols-4"
                )}
              >
                {durations.map((dur) => {
                  const isSelected = activeDuration.key === dur.key;
                  return (
                    <button
                      key={dur.key}
                      onClick={() => setSelectedDurationKey(dur.key)}
                      className={`relative py-2.5 px-2 rounded-xl font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 flex flex-col items-center justify-center text-center ${
                        isSelected
                          ? "bg-cyan-400 text-neutral-950 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                          : "text-neutral-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 justify-center flex-wrap">
                        <span>{dur.label}</span>
                        {dur.badge && (
                          <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#FFB900] text-neutral-950 uppercase tracking-wider leading-none shadow-2xs">
                            {dur.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-normal opacity-85">
                        {dur.subLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Large Prominent Price Display Box (Matching Screenshot 1 Style) */}
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-oswald text-neutral-400 uppercase tracking-wider block">
                      {activeDuration.label} ISKOOL MEAL PRICE
                    </span>
                    {discount && (
                      <DiscountBadge
                        discount={discount}
                        actualPrice={activeDuration.price}
                        theme="dark"
                      />
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-oswald text-sm font-bold text-cyan-400">
                      LKR
                    </span>
                    {/* Actual price (not deducted in preview as requested) */}
                    <span className="font-oswald text-3xl sm:text-4xl font-black text-cyan-400 tracking-tight leading-none">
                      {activeDuration.price.toLocaleString("en-US")}
                    </span>
                    <span className="text-xs text-neutral-400 font-light">
                      / {activeDuration.unit}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs text-neutral-400 font-light">
                  {discount ? (
                    <div>
                      <div className="text-cyan-400 font-bold text-xs sm:text-sm font-oswald">
                        Pay LKR {discountedPrice.toLocaleString("en-US")} with {discount.percentage}% OFF
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        ~LKR {Math.round(discountedPrice / activeDuration.days)} / meal
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-white font-medium">
                        ~LKR {Math.round(activeDuration.price / activeDuration.days)} / meal
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        School Morning Delivery
                      </div>
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-300 font-light">
                {activeDuration.description}
              </p>
            </div>

            {/* ─── Dynamic Rules & Schedule Box (Monthly / Weekly / Hybrid Fuel) ─── */}
            <div className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
              <div className="flex items-center gap-2 font-oswald text-xs font-bold uppercase tracking-wider text-neutral-200">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeDuration.label} Plan Rules &amp; Schedule</span>
              </div>
              <ul className="text-xs text-neutral-300 space-y-2 font-light">
                {activeDuration.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ─── Action Button ─── */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 w-full">
              <button
                onClick={handleSubscribeClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-oswald text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95"
              >
                {discount ? (
                  <span className="flex items-center gap-2 flex-wrap justify-center">
                    <span>
                      SUBSCRIBE TO {pkg?.name ? pkg.name.toUpperCase() : "ISKOOL"} (
                      {activeDuration.label} • LKR{" "}
                      {discountedPrice.toLocaleString("en-US")})
                    </span>
                    <span className="text-[11px] line-through opacity-70 font-normal">
                      LKR {activeDuration.price.toLocaleString("en-US")}
                    </span>
                    <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full uppercase shadow-2xs">
                      {discount.percentage}% OFF
                    </span>
                  </span>
                ) : (
                  <span>
                    SUBSCRIBE TO {pkg?.name ? pkg.name.toUpperCase() : "ISKOOL"} (
                    {activeDuration.label} • LKR{" "}
                    {activeDuration.price.toLocaleString("en-US")})
                  </span>
                )}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Subscribe Modal ─── */}
      <SubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageName={pkg?.name ? `${pkg.name.toUpperCase()} MEAL PLAN` : "ISKOOL MEAL PLAN"}
        packageId={pkg?.id || "iskool-default"}
        planName={`${activeDuration.label} (${activeDuration.subLabel})${
          discount ? ` • ${discount.name} (${discount.percentage}% OFF)` : ""
        }`}
        planId={activeDuration.planId || activeDuration.key}
        planType={activeDuration.planType}
        durationLimit={activeDuration.durationLimit || activeDuration.days}
        discountId={discount?.id}
        price={`LKR ${discountedPrice.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`}
      />
    </section>
  );
}

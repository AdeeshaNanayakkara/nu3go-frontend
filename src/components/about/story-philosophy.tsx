"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UtensilsCrossed,
  Dumbbell,
  Leaf,
  GraduationCap,
  ShieldCheck,
  Scale,
  ChefHat,
  ArrowRight,
  Zap,
  Repeat,
  RefreshCw,
  Truck,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function StoryPhilosophy() {
  const containerRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const coreFeaturesRef = useRef<HTMLDivElement | null>(null);
  const plansRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Dynamic Parallax Background Scrub (Moves smoothly on Up & Down scroll)
      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { yPercent: -14 },
          {
            yPercent: 14,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      // 2. Header Animation (Plays once on first scroll)
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // 3. Core Features Stagger (Plays once on first scroll)
      if (coreFeaturesRef.current) {
        gsap.fromTo(
          coreFeaturesRef.current.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.18,
            ease: "power3.out",
            scrollTrigger: {
              trigger: coreFeaturesRef.current,
              start: "top 82%",
              once: true,
            },
          }
        );
      }

      // 4. Meal Plans Stagger (Plays once on first scroll)
      if (plansRef.current) {
        gsap.fromTo(
          plansRef.current.children,
          { opacity: 0, scale: 0.94, y: 35 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: plansRef.current,
              start: "top 82%",
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative bg-neutral-900 text-white py-20 sm:py-28 lg:py-32 overflow-hidden select-none"
    >
      {/* ─── Parallax Background (Moving smoothly on Up & Down Scroll) ─── */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-[130%] -top-[15%] pointer-events-none will-change-transform"
      >
        <Image
          src="/images/how-to-work.jpg"
          alt="nu3go Culinary Atmosphere and Wholesome Breakfast Preparation"
          fill
          quality={95}
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark Film Noir Overlay */}
        <div className="absolute inset-0 bg-neutral-950/78 backdrop-blur-[1.5px]" />
      </div>

      {/* Background Ambience Highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-800/40 via-transparent to-black pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#36D068]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* ─── Subtitle Badge & Header ─── */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#36D068]/15 border border-[#36D068]/30 mb-4">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#36D068]" />
            <span className="font-oswald text-xs font-bold tracking-[0.2em] uppercase text-[#36D068]">
              HOW IT WORKS
            </span>
          </div>

          <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.08] mb-5">
            Core Features &amp; <span className="text-[#36D068]">Daily Mechanics</span>
          </h2>

          <p className="text-white/80 text-base sm:text-lg leading-relaxed font-light">
            Every weekday morning (Monday to Friday), nu3go delivers nutritional, ready-to-eat breakfasts
            calibrated to your lifestyle, complete with weekly menu rotations, flexible meal swapping, and 100% free delivery.
          </p>
        </div>

        {/* ─── 3 Core Features & Mechanics ─── */}
        <div ref={coreFeaturesRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 sm:mb-28">
          {/* Feature 1: Rotating Healthy Menu */}
          <div className="bg-neutral-800/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:border-[#36D068]/40 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#36D068]/15 flex items-center justify-center text-[#36D068] mb-6 group-hover:scale-110 transition-transform">
              <Repeat className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold font-oswald text-[#36D068] tracking-widest uppercase block mb-1">
              VARIETY &amp; TASTE
            </span>
            <h3 className="font-oswald text-2xl font-bold uppercase tracking-tight text-white mb-3">
              Rotating Healthy Menu
            </h3>
            <p className="text-white/70 text-sm leading-relaxed font-light mb-4">
              Enjoy a varied, constantly changing weekly menu. Savor favorites like <strong>overnight fruit &amp; nut oats</strong>,
              <strong> high-protein pasta</strong>, <strong>specialized omelets</strong>, artisan sandwiches, and traditional
              wholesome options like <strong>chapathi wraps</strong> and <strong>healthy stringhopper packs</strong>.
            </p>
            <div className="text-xs text-[#36D068] font-oswald uppercase tracking-wider font-semibold">
              Never boring &bull; Chef-Prepared
            </div>
          </div>

          {/* Feature 2: Flexible Hybrid Routines & Meal Swapping */}
          <div className="bg-neutral-800/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:border-[#36D068]/40 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold font-oswald text-amber-400 tracking-widest uppercase block mb-1">
              HYBRID-WORK MODEL
            </span>
            <h3 className="font-oswald text-2xl font-bold uppercase tracking-tight text-white mb-3">
              Flexible Routines &amp; Swaps
            </h3>
            <p className="text-white/70 text-sm leading-relaxed font-light mb-4">
              Subscriptions run on <strong>weekly or monthly plans</strong>. Designed for modern hybrid work, you can
              assign different delivery addresses (home vs office) and <strong>swap meals from alternative menu choices</strong> if
              you aren&apos;t in the mood for the day&apos;s scheduled dish.
            </p>
            <div className="text-xs text-amber-400 font-oswald uppercase tracking-wider font-semibold">
              Weekly &amp; Monthly &bull; Meal Swapping
            </div>
          </div>

          {/* Feature 3: 100% Free Delivery */}
          <div className="bg-neutral-800/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:border-[#36D068]/40 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <Truck className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold font-oswald text-blue-400 tracking-widest uppercase block mb-1">
              ZERO HIDDEN COSTS
            </span>
            <h3 className="font-oswald text-2xl font-bold uppercase tracking-tight text-white mb-3">
              100% Free Delivery
            </h3>
            <p className="text-white/70 text-sm leading-relaxed font-light mb-4">
              We guarantee standard weekday morning delivery by <strong>7:30 AM with 100% free shipping and zero hidden fees</strong>.
              Operating primarily within the <strong>Colombo and Wattala areas</strong>, your breakfast arrives ready to eat
              right at your doorstep or office desk before work begins.
            </p>
            <div className="text-xs text-blue-400 font-oswald uppercase tracking-wider font-semibold">
              Colombo &amp; Wattala &bull; Free Shipping
            </div>
          </div>
        </div>

        {/* ─── The 4 Purpose-Built Nutrition Tiers ─── */}
        <div className="relative">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-bold font-oswald tracking-[0.25em] text-[#36D068] uppercase block mb-2">
              CURATED MEAL TIERS
            </span>
            <h3 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-tight">
              4 Tailored Nutrition Tiers
            </h3>
            <p className="text-white/70 text-xs sm:text-sm mt-2 font-light">
              Tailored nutritional options for gym-goers, busy corporate executives, high-intensity hustlers, and school students.
            </p>
          </div>

          <div ref={plansRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. POWER */}
            <div className="bg-gradient-to-b from-[#FF0844]/20 to-neutral-900 p-6 rounded-2xl border border-[#FF0844]/30 hover:border-[#FF0844] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FF0844]/20 text-[#FF456E] flex items-center justify-center mb-4">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <h4 className="font-oswald text-xl font-bold uppercase text-white tracking-tight">
                  POWER PLAN
                </h4>
                <p className="text-xs text-[#FFAAA6] font-semibold tracking-wider uppercase mt-0.5 mb-2">
                  High Protein Athlete Fuel
                </p>
                <p className="text-white/70 text-xs leading-relaxed font-light">
                  40g+ clean protein. Double chicken breast pasta, sourdough egg stacks, and macro oats shakes for muscle recovery and intense training.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest font-oswald">Target: Athletes</span>
                <span className="text-xs font-bold text-[#FF456E]">40g+ Protein</span>
              </div>
            </div>

            {/* 2. CLASSIC */}
            <div className="bg-gradient-to-b from-[#36D068]/20 to-neutral-900 p-6 rounded-2xl border border-[#36D068]/30 hover:border-[#36D068] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#36D068]/20 text-[#36D068] flex items-center justify-center mb-4">
                  <Leaf className="w-5 h-5" />
                </div>
                <h4 className="font-oswald text-xl font-bold uppercase text-white tracking-tight">
                  CLASSIC PLAN
                </h4>
                <p className="text-xs text-[#36D068] font-semibold tracking-wider uppercase mt-0.5 mb-2">
                  Everyday Balanced Vitality
                </p>
                <p className="text-white/70 text-xs leading-relaxed font-light">
                  Clean farm vegetables, wholesome grains, egg pasta bowls, and warm fruit oats. Steady focus for busy professionals with zero energy crash.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest font-oswald">Target: Professionals</span>
                <span className="text-xs font-bold text-[#36D068]">20g–26g Protein</span>
              </div>
            </div>

            {/* 3. FOURTIG */}
            <div className="bg-gradient-to-b from-orange-500/20 to-neutral-900 p-6 rounded-2xl border border-orange-500/30 hover:border-orange-400 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-oswald text-xl font-bold uppercase text-white tracking-tight">
                  fourtiG PLAN
                </h4>
                <p className="text-xs text-orange-300 font-semibold tracking-wider uppercase mt-0.5 mb-2">
                  Built for Hustlers
                </p>
                <p className="text-white/70 text-xs leading-relaxed font-light">
                  40g+ protein with 15 rotational chef meals. Quad-egg sourdough club, double chicken tortillas, and coconut tempered kadala bowls.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest font-oswald">Target: High Performers</span>
                <span className="text-xs font-bold text-orange-400">40g–48g Protein</span>
              </div>
            </div>

            {/* 4. ISKOOL */}
            <div className="bg-gradient-to-b from-blue-500/20 to-neutral-900 p-6 rounded-2xl border border-blue-500/30 hover:border-blue-400 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="font-oswald text-xl font-bold uppercase text-white tracking-tight">
                  ISKOOL PLAN
                </h4>
                <p className="text-xs text-blue-300 font-semibold tracking-wider uppercase mt-0.5 mb-2">
                  Kids School Breakfast
                </p>
                <p className="text-white/70 text-xs leading-relaxed font-light">
                  Chicken, egg &amp; wholesome grains to power students with all-day focus and nutrition. Soft pol rotti, chapathi rolls, and honey oat pots.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest font-oswald">Target: Students</span>
                <span className="text-xs font-bold text-blue-400">25g–32g Protein</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/plans"
              className="inline-flex items-center gap-2 text-xs font-bold font-oswald uppercase tracking-widest text-[#36D068] hover:text-white transition-colors group"
            >
              <span>Explore Weekly &amp; Monthly Subscriptions</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

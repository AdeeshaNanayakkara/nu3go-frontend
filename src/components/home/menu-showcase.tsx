"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Flame } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function MenuShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const tagRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);

  // Left & Right Floating Showcase Dishes
  const leftDishContainerRef = useRef<HTMLDivElement | null>(null);
  const leftDishFloatingRef = useRef<HTMLDivElement | null>(null);
  const rightDishContainerRef = useRef<HTMLDivElement | null>(null);
  const rightDishFloatingRef = useRef<HTMLDivElement | null>(null);

  // Row 1: POWER & CLASSIC
  const row1Ref = useRef<HTMLDivElement | null>(null);
  const cardPowerRef = useRef<HTMLAnchorElement | null>(null);
  const cardClassicRef = useRef<HTMLAnchorElement | null>(null);
  const powerDishContainerRef = useRef<HTMLDivElement | null>(null);
  const classicDishContainerRef = useRef<HTMLDivElement | null>(null);
  const powerDishRef = useRef<HTMLDivElement | null>(null);
  const classicDishRef = useRef<HTMLDivElement | null>(null);

  // Row 2: ISKOOL & fourtiG
  const row2Ref = useRef<HTMLDivElement | null>(null);
  const cardIskoolRef = useRef<HTMLAnchorElement | null>(null);
  const cardFourtigRef = useRef<HTMLAnchorElement | null>(null);
  const iskoolDishContainerRef = useRef<HTMLDivElement | null>(null);
  const fourtigDishContainerRef = useRef<HTMLDivElement | null>(null);
  const iskoolDishRef = useRef<HTMLDivElement | null>(null);
  const fourtigDishRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ─── Unified Seamless Master Timeline for Menu Showcase ───
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
          once: true,
        },
        defaults: { ease: "power2.out", force3D: true },
      });

      // 1. Header Elements
      if (tagRef.current) {
        masterTl.fromTo(
          tagRef.current,
          { autoAlpha: 0, y: -20 },
          { autoAlpha: 1, y: 0, duration: 0.8, clearProps: "transform,opacity,visibility" }
        );
      }

      if (titleRef.current) {
        masterTl.fromTo(
          titleRef.current,
          { autoAlpha: 0, y: 25, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, clearProps: "transform,opacity,visibility" },
          "-=0.5"
        );
      }

      if (descRef.current) {
        masterTl.fromTo(
          descRef.current,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.8, clearProps: "transform,opacity,visibility" },
          "-=0.6"
        );
      }

      if (ctaRef.current) {
        masterTl.fromTo(
          ctaRef.current,
          { autoAlpha: 0, y: 14, scale: 0.95 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, clearProps: "transform,opacity,visibility" },
          "-=0.6"
        );
      }

      // Side Floating Showcase Dishes (Outer Containers)
      if (leftDishContainerRef.current) {
        masterTl.fromTo(
          leftDishContainerRef.current,
          { autoAlpha: 0, x: -70 },
          { autoAlpha: 1, x: 0, duration: 1.2, clearProps: "transform,opacity,visibility" },
          "-=0.7"
        );
      }

      if (rightDishContainerRef.current) {
        masterTl.fromTo(
          rightDishContainerRef.current,
          { autoAlpha: 0, x: 70 },
          { autoAlpha: 1, x: 0, duration: 1.2, clearProps: "transform,opacity,visibility" },
          "<0.1"
        );
      }

      // ─── 2. Smooth Simultaneous Glide-in from Both Sides ───
      // Row 1: POWER (from Left) & CLASSIC (from Right)
      if (cardPowerRef.current) {
        masterTl.fromTo(
          cardPowerRef.current,
          { autoAlpha: 0, x: -140 },
          { autoAlpha: 1, x: 0, duration: 1.4, ease: "power2.out", clearProps: "transform,opacity,visibility" },
          "-=0.8"
        );
      }

      if (cardClassicRef.current) {
        masterTl.fromTo(
          cardClassicRef.current,
          { autoAlpha: 0, x: 140 },
          { autoAlpha: 1, x: 0, duration: 1.4, ease: "power2.out", clearProps: "transform,opacity,visibility" },
          "<"
        );
      }

      if (powerDishContainerRef.current) {
        masterTl.fromTo(
          powerDishContainerRef.current,
          { autoAlpha: 0, scale: 0.85 },
          { autoAlpha: 1, scale: 1, duration: 1.3, ease: "power2.out", clearProps: "transform,opacity,visibility" },
          "<0.1"
        );
      }

      if (classicDishContainerRef.current) {
        masterTl.fromTo(
          classicDishContainerRef.current,
          { autoAlpha: 0, scale: 0.85 },
          { autoAlpha: 1, scale: 1, duration: 1.3, ease: "power2.out", clearProps: "transform,opacity,visibility" },
          "<"
        );
      }

      // Row 2: ISKOOL (from Left) & fourtiG (from Right) — Flowing seamlessly with Row 1
      if (cardIskoolRef.current) {
        masterTl.fromTo(
          cardIskoolRef.current,
          { autoAlpha: 0, x: -140 },
          { autoAlpha: 1, x: 0, duration: 1.4, ease: "power2.out", clearProps: "transform,opacity,visibility" },
          "-=1.1"
        );
      }

      if (cardFourtigRef.current) {
        masterTl.fromTo(
          cardFourtigRef.current,
          { autoAlpha: 0, x: 140 },
          { autoAlpha: 1, x: 0, duration: 1.4, ease: "power2.out", clearProps: "transform,opacity,visibility" },
          "<"
        );
      }

      if (iskoolDishContainerRef.current) {
        masterTl.fromTo(
          iskoolDishContainerRef.current,
          { autoAlpha: 0, scale: 0.85 },
          { autoAlpha: 1, scale: 1, duration: 1.3, ease: "power2.out", clearProps: "transform,opacity,visibility" },
          "<0.1"
        );
      }

      if (fourtigDishContainerRef.current) {
        masterTl.fromTo(
          fourtigDishContainerRef.current,
          { autoAlpha: 0, scale: 0.85 },
          { autoAlpha: 1, scale: 1, duration: 1.3, ease: "power2.out", clearProps: "transform,opacity" },
          "<"
        );
      }

      // ─── 3. Scroll Parallax for Side Floating Dishes (Desktop Only) ───
      if (leftDishFloatingRef.current) {
        gsap.fromTo(
          leftDishFloatingRef.current,
          { yPercent: 12, rotation: -4 },
          {
            yPercent: -12,
            rotation: 4,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      if (rightDishFloatingRef.current) {
        gsap.fromTo(
          rightDishFloatingRef.current,
          { yPercent: -12, rotation: 4 },
          {
            yPercent: 12,
            rotation: -4,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      // ─── 4. Scroll Parallax for Card Dishes (Pure GSAP Target without CSS transition fight) ───
      if (powerDishRef.current) {
        gsap.fromTo(
          powerDishRef.current,
          { yPercent: 8, rotation: -3 },
          {
            yPercent: -8,
            rotation: 3,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      if (classicDishRef.current) {
        gsap.fromTo(
          classicDishRef.current,
          { yPercent: -8, rotation: 3 },
          {
            yPercent: 8,
            rotation: -3,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      if (iskoolDishRef.current) {
        gsap.fromTo(
          iskoolDishRef.current,
          { yPercent: 8, rotation: -3 },
          {
            yPercent: -8,
            rotation: 3,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      if (fourtigDishRef.current) {
        gsap.fromTo(
          fourtigDishRef.current,
          { yPercent: -8, rotation: 3 },
          {
            yPercent: 8,
            rotation: -3,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }
    }, sectionRef);

    // Refresh ScrollTrigger cleanly after hydration layout stabilizes
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#F7F6F2] pt-24 sm:pt-28 lg:pt-32 pb-32 sm:pb-44 lg:pb-56 overflow-hidden select-none"
    >
      {/* ─── Header: 3-Column Balanced Layout on Desktop (Left Dish + Center Info + Right Dish) ─── */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* ══════════════════════════════════════════════════════════
              LEFT SIDE: Fresh & Clean Floating Dish Showcase (Desktop Only)
             ══════════════════════════════════════════════════════════ */}
          <div
            ref={leftDishContainerRef}
            className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center relative will-change-transform"
          >
            {/* Ambient Dish Glow */}
            <div className="absolute inset-0 bg-[#36D068]/20 rounded-full blur-2xl transform scale-75 pointer-events-none" />

            {/* Inner Floating Ref for Parallax Scrub */}
            <div
              ref={leftDishFloatingRef}
              className="flex flex-col items-center will-change-transform"
            >
              {/* Floating Fresh Dish with Isolated CSS Hover Transition */}
              <div className="relative w-44 h-44 xl:w-52 xl:h-52 rounded-full overflow-hidden shadow-2xl shadow-emerald-950/15 border-4 border-white/90 transition-transform duration-500 hover:scale-105">
                <Image
                  src="/images/menu-fresh-bowl.jpg"
                  alt="Nu3Go Fresh Clean Salad Bowl"
                  fill
                  sizes="(max-width: 1280px) 176px, 208px"
                  className="object-cover pointer-events-none"
                />
              </div>

              {/* Pill Badge */}
              <div className="mt-3 bg-white/95 backdrop-blur-md border border-neutral-200/80 shadow-md rounded-full py-1.5 px-4 flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-[#36D068]" />
                <span className="font-oswald text-xs font-bold uppercase tracking-wider text-neutral-800">
                  100% FRESH PRODUCE
                </span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              CENTER COLUMN: Main Title, Tag, Subtitle & CTA Button
             ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 flex flex-col items-center text-center max-w-2xl mx-auto w-full relative">
            {/* Ambient Center Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-64 bg-gradient-to-r from-[#36D068]/10 via-transparent to-[#E31B23]/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Subtitle / Tag */}
            <span
              ref={tagRef}
              className="font-oswald text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#36D068] mb-3 will-change-[transform,opacity]"
            >
              CHOOSE YOUR FLAVOR
            </span>

            {/* Main Title */}
            <h2
              ref={titleRef}
              className="font-oswald text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black uppercase text-neutral-900 tracking-tight leading-[1.08] mb-4 will-change-[transform,opacity]"
            >
              YOUR FAVORITE FOOD, <br />
              ALL IN ONE PLACE!
            </h2>

            {/* Description Subtext */}
            <p
              ref={descRef}
              className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8 font-normal will-change-[transform,opacity]"
            >
              Explore our curated meal subscription plans designed to fuel athletic performance, family wellness, active lifestyles, and growing kids.
            </p>

            {/* CTA Outlined Button */}
            <Link
              ref={ctaRef}
              href="/menu"
              className="inline-block border-2 border-[#36D068] text-[#36D068] hover:bg-[#36D068] hover:text-white px-8 py-3 font-oswald text-xs sm:text-sm font-bold tracking-[0.15em] uppercase transition-colors duration-300 hover:shadow-lg hover:shadow-[#36D068]/20 will-change-[transform,opacity]"
            >
              VIEW ALL MENU
            </Link>
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT SIDE: High Protein & Macro Dish Showcase (Desktop Only)
             ══════════════════════════════════════════════════════════ */}
          <div
            ref={rightDishContainerRef}
            className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center relative will-change-transform"
          >
            {/* Ambient Dish Glow */}
            <div className="absolute inset-0 bg-[#E31B23]/20 rounded-full blur-2xl transform scale-75 pointer-events-none" />

            {/* Inner Floating Ref for Parallax Scrub */}
            <div
              ref={rightDishFloatingRef}
              className="flex flex-col items-center will-change-transform"
            >
              {/* Floating Protein Dish with Isolated CSS Hover Transition */}
              <div className="relative w-44 h-44 xl:w-52 xl:h-52 rounded-full overflow-hidden shadow-2xl shadow-red-950/15 border-4 border-white/90 transition-transform duration-500 hover:scale-105">
                <Image
                  src="/images/menu-protein-bowl.jpg"
                  alt="Nu3Go High Protein Steak & Egg Bowl"
                  fill
                  sizes="(max-width: 1280px) 176px, 208px"
                  className="object-cover pointer-events-none"
                />
              </div>

              {/* Pill Badge */}
              <div className="mt-3 bg-white/95 backdrop-blur-md border border-neutral-200/80 shadow-md rounded-full py-1.5 px-4 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#E31B23]" />
                <span className="font-oswald text-xs font-bold uppercase tracking-wider text-neutral-800">
                  HIGH PROTEIN MACROS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          FULL-WIDTH EDGE-TO-EDGE SLANTED SPLIT CARDS CONTAINER
         ══════════════════════════════════════════════════════════════════ */}
      <div className="w-full relative z-10 mt-16 sm:mt-20 lg:mt-24 px-4 sm:px-6 lg:px-0 space-y-8 sm:space-y-12 lg:space-y-16">
        
        {/* ─────────────────────────────────────────────────────────────
            ROW 1: POWER (Pastel Rose to Neon Crimson) & CLASSIC (Pastel Mint to Neon Emerald)
           ───────────────────────────────────────────────────────────── */}
        <div ref={row1Ref} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 xl:gap-10 items-center w-full">
          {/* ─── Card 1: POWER (Pastel to Neon Crimson, Slanted Right) ─── */}
          <Link
            ref={cardPowerRef}
            href="/plans?package=power#plan-power"
            className="group relative bg-gradient-to-r from-[#FF0844] via-[#FF456E] to-[#FFAAA6] rounded-2xl lg:rounded-none lg:rounded-r-2xl shadow-2xl shadow-rose-500/30 p-6 sm:p-8 lg:py-10 xl:py-12 pl-6 sm:pl-10 md:pl-16 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+2rem))] pr-6 sm:pr-10 lg:pr-16 xl:pr-20 lg:[clip-path:polygon(0_0,100%_0,calc(100%-55px)_100%,0_100%)] lg:-mt-6 xl:-mt-8 transition-shadow duration-300 hover:shadow-rose-500/50 block will-change-transform cursor-pointer"
          >
            {/* Subtle glow layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/15 pointer-events-none" />

            {/* Inner Content */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between sm:justify-end gap-6 sm:gap-8 lg:gap-10 xl:gap-12 relative z-10">
              {/* Text Info (Left side) */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="font-oswald text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-white mb-1 bg-black/25 px-2.5 py-0.5 rounded backdrop-blur-xs">
                  HIGH PROTEIN MEALS
                </span>
                <h3 className="font-oswald text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-none mt-1 group-hover:scale-105 origin-left transition-transform duration-300 drop-shadow-md">
                  POWER
                </h3>
                <p className="text-white/95 text-xs sm:text-sm leading-relaxed mt-2 max-w-[210px] sm:max-w-[230px] font-medium drop-shadow-xs">
                  Max protein &amp; clean macros to fuel intense performance.
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 bg-black text-white hover:bg-neutral-900 px-5 py-2.5 rounded-full font-oswald text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md transition-all duration-300 group-hover:scale-105">
                  <span>EXPLORE POWER PLAN</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>

              {/* Circular Dish Outer Container (Entrance Target) */}
              <div
                ref={powerDishContainerRef}
                className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 xl:w-72 xl:h-72 drop-shadow-2xl shrink-0"
              >
                {/* Parallax Scrub Target (No CSS transition) */}
                <div
                  ref={powerDishRef}
                  className="w-full h-full will-change-transform"
                >
                  {/* Hover Scale Target (CSS transition only) */}
                  <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300 ease-out">
                    <Image
                      src="/images/power1.png"
                      alt="Nu3Go Power Bowl"
                      fill
                      className="object-contain pointer-events-none"
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 288px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* ─── Card 2: CLASSIC (Pastel Mint to Neon Emerald, Slanted Left) ─── */}
          <Link
            ref={cardClassicRef}
            href="/plans?package=classic#plan-classic"
            className="group relative bg-gradient-to-r from-[#70E0A5] via-[#10B981] to-[#00F59B] rounded-2xl lg:rounded-none lg:rounded-l-2xl shadow-2xl shadow-emerald-500/30 p-6 sm:p-8 lg:py-10 xl:py-12 pr-6 sm:pr-10 md:pr-16 lg:pr-[max(2.5rem,calc((100vw-1360px)/2+2rem))] pl-6 sm:pl-10 lg:pl-16 xl:pl-20 lg:[clip-path:polygon(55px_0,100%_0,100%_100%,0_100%)] lg:mt-6 xl:mt-8 transition-shadow duration-300 hover:shadow-emerald-500/50 block will-change-transform cursor-pointer"
          >
            {/* Subtle glow layer */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/10 via-transparent to-white/15 pointer-events-none" />

            {/* Inner Content */}
            <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-start gap-6 sm:gap-8 lg:gap-10 xl:gap-12 relative z-10">
              {/* Circular Dish Outer Container (Entrance Target) */}
              <div
                ref={classicDishContainerRef}
                className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 xl:w-72 xl:h-72 drop-shadow-2xl shrink-0"
              >
                {/* Parallax Scrub Target (No CSS transition) */}
                <div
                  ref={classicDishRef}
                  className="w-full h-full will-change-transform"
                >
                  {/* Hover Scale Target (CSS transition only) */}
                  <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300 ease-out">
                    <Image
                      src="/images/classic1.png"
                      alt="Nu3Go Classic Bowl"
                      fill
                      className="object-contain pointer-events-none"
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 288px"
                    />
                  </div>
                </div>
              </div>

              {/* Text Info (Right side) */}
              <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                <span className="font-oswald text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-white mb-1 bg-black/25 px-2.5 py-0.5 rounded backdrop-blur-xs">
                  WHOLESOME BALANCED
                </span>
                <h3 className="font-oswald text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-none mt-1 group-hover:scale-105 origin-right transition-transform duration-300 drop-shadow-md">
                  CLASSIC
                </h3>
                <p className="text-white/95 text-xs sm:text-sm leading-relaxed mt-2 max-w-[210px] sm:max-w-[230px] font-medium drop-shadow-xs">
                  Fresh farm vegetables &amp; chef crafted wholesome balance.
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 bg-black text-white hover:bg-neutral-900 px-5 py-2.5 rounded-full font-oswald text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md transition-all duration-300 group-hover:scale-105">
                  <span>EXPLORE CLASSIC PLAN</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ROW 2: ISKOOL (Pastel Periwinkle to Neon Blue) & fourtiG (Pastel Peach to Neon Orange)
           ───────────────────────────────────────────────────────────── */}
        <div ref={row2Ref} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 xl:gap-10 items-center w-full">
          {/* ─── Card 3: ISKOOL (Pastel to Neon Blue, Slanted Right) ─── */}
          <Link
            ref={cardIskoolRef}
            href="/plans?package=iskool#plan-iskool"
            className="group relative bg-gradient-to-r from-[#1E3AFB] via-[#4A69FF] to-[#9DB5FF] rounded-2xl lg:rounded-none lg:rounded-r-2xl shadow-2xl shadow-blue-500/30 p-6 sm:p-8 lg:py-10 xl:py-12 pl-6 sm:pl-10 md:pl-16 lg:pl-[max(2.5rem,calc((100vw-1360px)/2+2rem))] pr-6 sm:pr-10 lg:pr-16 xl:pr-20 lg:[clip-path:polygon(0_0,100%_0,calc(100%-55px)_100%,0_100%)] lg:-mt-6 xl:-mt-8 transition-shadow duration-300 hover:shadow-blue-500/50 block will-change-transform cursor-pointer"
          >
            {/* Subtle glow layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/15 pointer-events-none" />

            {/* Inner Content */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between sm:justify-end gap-6 sm:gap-8 lg:gap-10 xl:gap-12 relative z-10">
              {/* Text Info (Left side) */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="font-oswald text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-white mb-1 bg-black/25 px-2.5 py-0.5 rounded backdrop-blur-xs">
                  KIDS SCHOOL BREAKFAST
                </span>
                <h3 className="font-oswald text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-none mt-1 group-hover:scale-105 origin-left transition-transform duration-300 drop-shadow-md">
                  ISKOOL
                </h3>
                <p className="text-white/95 text-xs sm:text-sm leading-relaxed mt-2 max-w-[210px] sm:max-w-[240px] font-medium drop-shadow-xs">
                  Chicken, egg &amp; meat-led protein to power growing kids with all-day focus.
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 bg-black text-white hover:bg-neutral-900 px-5 py-2.5 rounded-full font-oswald text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md transition-all duration-300 group-hover:scale-105">
                  <span>EXPLORE ISKOOL PLAN</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>

              {/* Circular Dish Outer Container (Entrance Target) */}
              <div
                ref={iskoolDishContainerRef}
                className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 xl:w-72 xl:h-72 drop-shadow-2xl shrink-0"
              >
                {/* Parallax Scrub Target (No CSS transition) */}
                <div
                  ref={iskoolDishRef}
                  className="w-full h-full will-change-transform"
                >
                  {/* Hover Scale Target (CSS transition only) */}
                  <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300 ease-out">
                    <Image
                      src="/images/hero-dish2.png"
                      alt="Nu3Go Iskool Kids Fuel Bowl"
                      fill
                      className="object-contain pointer-events-none"
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 288px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* ─── Card 4: fourtiG (Pastel Peach to Neon Orange, Slanted Left) ─── */}
          <Link
            ref={cardFourtigRef}
            href="/plans?package=fourtig#plan-fourtig"
            className="group relative bg-gradient-to-r from-[#FFC285] via-[#FF7A00] to-[#FF5100] rounded-2xl lg:rounded-none lg:rounded-l-2xl shadow-2xl shadow-orange-500/30 p-6 sm:p-8 lg:py-10 xl:py-12 pr-6 sm:pr-10 md:pr-16 lg:pr-[max(2.5rem,calc((100vw-1360px)/2+2rem))] pl-6 sm:pl-10 lg:pl-16 xl:pl-20 lg:[clip-path:polygon(55px_0,100%_0,100%_100%,0_100%)] lg:mt-6 xl:mt-8 transition-shadow duration-300 hover:shadow-orange-500/50 block will-change-transform cursor-pointer"
          >
            {/* Subtle glow layer */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/10 via-transparent to-white/15 pointer-events-none" />

            {/* Inner Content */}
            <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-start gap-6 sm:gap-8 lg:gap-10 xl:gap-12 relative z-10">
              {/* Circular Dish Outer Container (Entrance Target) */}
              <div
                ref={fourtigDishContainerRef}
                className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 xl:w-72 xl:h-72 drop-shadow-2xl shrink-0"
              >
                {/* Parallax Scrub Target (No CSS transition) */}
                <div
                  ref={fourtigDishRef}
                  className="w-full h-full will-change-transform"
                >
                  {/* Hover Scale Target (CSS transition only) */}
                  <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-300 ease-out">
                    <Image
                      src="/images/hero-dish3.png"
                      alt="Nu3Go fourtiG 40g Protein Breakfast Bowl"
                      fill
                      className="object-contain pointer-events-none"
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 288px"
                    />
                  </div>
                </div>
              </div>

              {/* Text Info (Right side) */}
              <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                <span className="font-oswald text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-white mb-1 bg-black/25 px-2.5 py-0.5 rounded backdrop-blur-xs">
                  40G PROTEIN BREAKFAST
                </span>
                <h3 className="font-oswald text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-none mt-1 group-hover:scale-105 origin-right transition-transform duration-300 drop-shadow-md">
                  fourtiG
                </h3>
                <p className="text-white/95 text-xs sm:text-sm leading-relaxed mt-2 max-w-[210px] sm:max-w-[240px] font-medium drop-shadow-xs">
                  Built for hustlers. 40g+ protein, 15 rotational chef meals delivered fresh every morning.
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 bg-black text-white hover:bg-neutral-900 px-5 py-2.5 rounded-full font-oswald text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md transition-all duration-300 group-hover:scale-105">
                  <span>EXPLORE fourtiG PLAN</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>

      </div>

      {/* ─── Bottom Curved Transition into White (#FFFFFF) ─── */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-20 sm:h-28 lg:h-36 xl:h-44 text-white fill-current block"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C480,140 960,140 1440,0 L1440,140 L0,140 Z" />
        </svg>
      </div>
    </section>
  );
}

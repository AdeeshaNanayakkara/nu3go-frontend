"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Leaf, UtensilsCrossed } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HighlightSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const tagRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement | null>(null);

  const glowRef = useRef<HTMLDivElement | null>(null);
  const mockupContainerRef = useRef<HTMLDivElement | null>(null);
  const mockupImgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ─── 1. Main Entrance Timeline (ScrollTriggered / Reload) ───
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
        defaults: { ease: "power2.out", force3D: true },
      });

      if (tagRef.current) {
        entranceTl.fromTo(
          tagRef.current,
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, duration: 0.7 }
        );
      }

      if (headingRef.current) {
        entranceTl.fromTo(
          headingRef.current,
          { opacity: 0, y: 32, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out" },
          "-=0.45"
        );
      }

      if (descRef.current) {
        entranceTl.fromTo(
          descRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.75 },
          "-=0.55"
        );
      }

      if (buttonsRef.current) {
        entranceTl.fromTo(
          buttonsRef.current.children,
          { opacity: 0, y: 20, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: "back.out(1.4)",
          },
          "-=0.5"
        );
      }

      // Device Mockup Slides in with subtle 3D depth
      if (mockupContainerRef.current) {
        entranceTl.fromTo(
          mockupContainerRef.current,
          { opacity: 0, x: 60, scale: 0.9, rotation: 3 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            rotation: 0,
            duration: 1.1,
            ease: "power3.out",
          },
          "-=0.85"
        );
      }

      // ─── 2. Dynamic Up & Down Scroll Parallax Scrubbing ───
      // Device Mockup tilts and glides vertically on scroll
      if (mockupImgRef.current) {
        gsap.fromTo(
          mockupImgRef.current,
          { y: 25, rotation: 2 },
          {
            y: -25,
            rotation: -2,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      // Left Content gentle counter parallax on scroll
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
          { yPercent: 3 },
          {
            yPercent: -3,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      // Ambient Glow scale pulse on scroll
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.85, opacity: 0.5 },
          {
            scale: 1.15,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
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
      className="relative w-full bg-[#FAF8F5] py-16 sm:py-20 lg:py-24 overflow-hidden select-none border-t border-neutral-200/60"
    >
      {/* ─── Ambient Glow Accents ─── */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#36D068]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#36D068]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-8 xl:gap-12 items-center">
          {/* ══════════════════════════════════════════════════════════
              LEFT COLUMN: Highlighted Headline & Value Proposition
             ══════════════════════════════════════════════════════════ */}
          <div
            ref={leftColRef}
            className="lg:col-span-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left will-change-transform"
          >
            {/* Top Tagline / Pill */}
            <div
              ref={tagRef}
              className="inline-flex items-center justify-center lg:justify-start gap-2 mb-3 will-change-[transform,opacity]"
            >
              <span className="font-oswald text-xs sm:text-sm font-bold tracking-[0.2em] text-[#36D068] uppercase flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-[#36D068]" />
                100% HEALTHY &amp; NUTRITIOUS BREAKFAST!
              </span>
            </div>

            {/* Main Highlighted Headline */}
            <h2
              ref={headingRef}
              className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[50px] font-black uppercase text-neutral-900 tracking-tight leading-[1.08] mb-4 sm:mb-5 will-change-[transform,opacity]"
            >
              SRI LANKA&apos;S FIRST-EVER{" "}
              <span className="text-[#36D068] block sm:inline">
                SUBSCRIPTION-BASED
              </span>{" "}
              HEALTHY BREAKFAST SERVICE!
            </h2>

            {/* Body Copy */}
            <p
              ref={descRef}
              className="text-neutral-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl font-light mb-6 sm:mb-8 mx-auto lg:mx-0 will-change-[transform,opacity]"
            >
              Skip the morning rush, grocery shopping, and meal prep. Receive chef-crafted, calorie-counted, macro-balanced healthy breakfast bowls and wraps delivered warm and fresh to your doorstep before 7:30 AM every weekday.
            </p>

            {/* Action Buttons (Centered on mobile, left on desktop) */}
            <div
              ref={buttonsRef}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 sm:gap-4 w-full sm:w-auto will-change-[transform,opacity]"
            >
              {/* Button 1: Subscribe Now */}
              <Link
                href="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 sm:py-3.5 border-2 border-[#E11D48] text-[#E11D48] hover:bg-[#E11D48] hover:text-white rounded-none font-oswald text-sm sm:text-base font-bold tracking-[0.12em] uppercase transition-colors duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="text-xs">▶</span>
                <span>SUBSCRIBE NOW</span>
              </Link>

              {/* Button 2: Explore Menu */}
              <Link
                href="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 sm:py-3.5 border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white rounded-none font-oswald text-sm sm:text-base font-bold tracking-[0.12em] uppercase transition-colors duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>EXPLORE MENU</span>
              </Link>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT COLUMN: Nu3Go Web & Mobile Experience Mockup
             ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 flex items-center justify-center relative mt-4 lg:mt-0 w-full">
            {/* Ambient Background Glow */}
            <div
              ref={glowRef}
              className="absolute inset-0 bg-gradient-to-tr from-[#36D068]/20 via-[#36D068]/5 to-transparent rounded-full blur-3xl transform scale-100 pointer-events-none will-change-transform"
            />

            {/* Showcase Device Mockup (Enlarged Transparent Cutout) */}
            <div
              ref={mockupContainerRef}
              className="relative w-full max-w-[500px] sm:max-w-[620px] lg:max-w-[700px] xl:max-w-[760px] aspect-[16/10] flex items-center justify-center mx-auto will-change-transform"
            >
              {/* Inner Mockup for Smooth Scroll Parallax & Organic Float */}
              <div
                ref={mockupImgRef}
                className="relative w-full h-full will-change-transform"
              >
                <Image
                  src="/images/nu3go-web.png"
                  alt="Nu3Go Web and Mobile Experience"
                  fill
                  quality={95}
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                  className="object-contain drop-shadow-2xl transition-transform duration-500 ease-out hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

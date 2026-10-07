"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Building2, UtensilsCrossed } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AboutExcellence() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ─── 1. Background Parallax Scrub ───
      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { yPercent: -12 },
          {
            yPercent: 12,
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

      // ─── 2. White Card Entrance with Staggered Children ───
      if (cardRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        });

        tl.fromTo(
          cardRef.current,
          { opacity: 0, x: -50, scale: 0.95 },
          { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: "power3.out" }
        ).fromTo(
          cardRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
          "-=0.5"
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[620px] sm:min-h-[680px] lg:min-h-[760px] overflow-hidden flex items-center py-16 sm:py-24 select-none"
    >
      {/* ─── Parallax Background Image (Culinary Kitchen & Plating) ─── */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-[130%] -top-[15%] pointer-events-none will-change-transform"
      >
        <Image
          src="/images/hero-bg-4.jpeg"
          alt="Nu3Go Gourmet Culinary Prep Facility"
          fill
          quality={95}
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Subtle Atmospheric Overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* ─── Foreground Container with Left-Aligned White Card ─── */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-20">
        <div
          ref={cardRef}
          className="w-full max-w-[540px] sm:max-w-[580px] lg:max-w-[600px] bg-white p-8 sm:p-12 lg:p-14 shadow-2xl shadow-black/30 rounded-2xl border border-neutral-100 text-neutral-900 will-change-[transform,opacity]"
        >
          {/* Tagline */}
          <span className="font-oswald text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#36D068] block mb-2 sm:mb-3">
            THE NU3GO KITCHEN
          </span>

          {/* Heading */}
          <h2 className="font-oswald text-3xl sm:text-4xl lg:text-[42px] font-black uppercase text-neutral-900 tracking-tight leading-[1.08] mb-4">
            INCREDIBLE DISHES START HERE
          </h2>

          {/* Subtitle */}
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-8 sm:mb-10 font-normal">
            Where culinary artistry meets clinical precision. Our chefs craft vibrant, gourmet meals prepared fresh every single morning without shortcuts.
          </p>

          {/* ─── Icon Feature 1 ─── */}
          <div className="flex items-start gap-4 sm:gap-5 mb-6 sm:mb-8 group">
            <div className="text-[#36D068] mt-1 shrink-0">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-oswald text-base sm:text-lg lg:text-xl font-bold uppercase text-neutral-900 tracking-tight mb-1">
                5,000+ SQ FT CERTIFIED FACILITY
              </h4>
              <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                Temperature-controlled culinary prep zones and hospital-grade sanitization preserving peak micronutrient freshness and enzyme vitality.
              </p>
            </div>
          </div>

          {/* ─── Icon Feature 2 ─── */}
          <div className="flex items-start gap-4 sm:gap-5 group">
            <div className="text-[#36D068] mt-1 shrink-0">
              <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-oswald text-base sm:text-lg lg:text-xl font-bold uppercase text-neutral-900 tracking-tight mb-1">
                HERITAGE FLAVORS YOU CAN TASTE
              </h4>
              <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                Slow-roasted tender meats, cold-pressed marinades, and fresh aromatic herbs that make healthy nutrition taste like a five-star dining experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

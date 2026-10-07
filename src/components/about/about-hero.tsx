"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AboutHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const tagRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ─── 1. Synchronized Entrance Timeline ───
      const entranceTl = gsap.timeline({
        defaults: { ease: "power3.out", force3D: true },
      });

      if (tagRef.current) {
        entranceTl.fromTo(
          tagRef.current,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.1 }
        );
      }

      if (titleRef.current) {
        entranceTl.fromTo(
          titleRef.current,
          { opacity: 0, y: 32, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" },
          "-=0.45"
        );
      }

      if (descRef.current) {
        entranceTl.fromTo(
          descRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.55"
        );
      }

      // ─── 2. Smooth Parallax Scrub on Scroll ───
      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.2,
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
      className="relative w-full overflow-hidden select-none bg-neutral-950 pt-36 sm:pt-44 lg:pt-48 pb-28 sm:pb-36 lg:pb-44 flex flex-col justify-center items-center text-center"
    >
      {/* ─── Background Culinary Image with Parallax Scrub ─── */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%] pointer-events-none will-change-transform"
      >
        <Image
          src="/images/about-hero-bg.jpg"
          alt="Nu3Go Gourmet Culinary Craftsmanship"
          fill
          priority
          quality={95}
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/90" />
      </div>

      {/* ─── Brand Glow Accent ─── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-96 bg-[#36D068]/15 rounded-full blur-3xl pointer-events-none z-10" />

      {/* ─── Hero Content ─── */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 relative z-20 flex flex-col items-center">
        <span
          ref={tagRef}
          className="font-oswald text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#36D068] mb-3 will-change-[transform,opacity]"
        >
          OUR ESSENCE & PHILOSOPHY
        </span>

        <h1
          ref={titleRef}
          className="font-oswald text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase text-white tracking-tight leading-none mb-4 sm:mb-5 drop-shadow-xl will-change-[transform,opacity]"
        >
          ABOUT NU3GO
        </h1>

        <p
          ref={descRef}
          className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-light will-change-[transform,opacity]"
        >
          Pioneering the future of gourmet wellness. We combine fine dining culinary mastery with precision sports nutrition to deliver fresh, macro-balanced meals directly to your doorstep.
        </p>
      </div>

      {/* ─── Outward Downward Curved SVG Bottom Divider (Pizzeria Template Style) ─── */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none -mb-px">
        <svg
          viewBox="0 0 1440 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-16 sm:h-24 md:h-28 lg:h-36 block text-[#F7F6F2] fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0 0 C480 140 960 140 1440 0 V160 H0 Z" />
        </svg>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ShieldCheck, XCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
  { value: "150,000+", label: "Precision Meals Delivered", sub: "Across Colombo & suburbs" },
  { value: "100%", label: "Fresh Farm Ingredients", sub: "Zero canned or frozen fillers" },
  { value: "4", label: "Specialized Fuel Plans", sub: "Calibrated to your exact lifestyle" },
  { value: "99.4%", label: "Satisfaction & Retention", sub: "Real people, real daily results" },
];

export function StorySanctuary() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Parallax Background Scrub
      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { yPercent: -10 },
          {
            yPercent: 10,
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

      // 2. Content stagger entrance
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // 3. Stats entrance
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          { opacity: 0, scale: 0.9, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 80%",
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
      className="relative w-full min-h-[750px] overflow-hidden py-24 sm:py-32 select-none flex flex-col justify-center text-white"
    >
      {/* ─── Parallax Background ─── */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-[125%] -top-[12%] pointer-events-none will-change-transform"
      >
        <Image
          src="/images/hero-bg-4.jpeg"
          alt="Nu3Go 5,000+ Sq Ft Master Culinary Facility"
          fill
          quality={95}
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark Film Noir Overlay */}
        <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-10">
        {/* ─── Subtitle Badge & Header ─── */}
        <div ref={contentRef} className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#36D068]/20 border border-[#36D068]/40 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#36D068]" />
            <span className="font-oswald text-xs font-bold tracking-[0.2em] uppercase text-[#36D068]">
              KITCHEN STANDARDS
            </span>
          </div>

          <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.08] mb-5">
            Inside the 5,000+ Sq Ft <br className="hidden sm:inline" />
            <span className="text-[#36D068]">Kitchen Sanctuary</span>
          </h2>

          <p className="text-white/80 text-base sm:text-lg leading-relaxed font-light">
            We operate our central kitchen with strict temperature-controlled prep zones and clinical hygiene standards.
            Here is our unbroken pledge of what goes onto your plate—and what we forbid forever.
          </p>
        </div>

        {/* ─── The Zero-Compromise Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Strictly Forbidden */}
          <div className="bg-neutral-900/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-red-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold font-oswald tracking-widest uppercase text-red-400 block">
                  NEVER IN OUR KITCHEN
                </span>
                <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-white">
                  The Zero-Tolerance Blacklist
                </h3>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-white/80 font-light">
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold">&#10005;</span>
                <span><strong>No Reused Cooking Oils:</strong> Reheating cooking oils creates harmful trans fats. We use strictly single-pour cold-pressed botanical oils.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold">&#10005;</span>
                <span><strong>No MSG or Artificial Bouillon:</strong> We rely exclusively on roasted aromatics, Ceylon cinnamon, curry leaves, and ginger.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 font-bold">&#10005;</span>
                <span><strong>No Refined Sugars or Syrups:</strong> Sweetness in our breakfast pots comes strictly from raw bee honey and whole bananas.</span>
              </li>
            </ul>
          </div>

          {/* Always Guaranteed */}
          <div className="bg-neutral-900/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-[#36D068]/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#36D068]/20 flex items-center justify-center text-[#36D068]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold font-oswald tracking-widest uppercase text-[#36D068] block">
                  ALWAYS GUARANTEED
                </span>
                <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-white">
                  The Nu3Go Gold Standards
                </h3>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-white/80 font-light">
              <li className="flex items-start gap-3">
                <span className="text-[#36D068] font-bold">&#10003;</span>
                <span><strong>Cold-Pressed Botanical Oils:</strong> Virgin olive oil, pure cold-pressed coconut oil, and sesame oil only.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#36D068] font-bold">&#10003;</span>
                <span><strong>Digital Scale Macro Weighing:</strong> Every single container is hand-measured on calibrated digital scales.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#36D068] font-bold">&#10003;</span>
                <span><strong>Daily Farm Deliveries:</strong> Zero freezer backlogs. Raw ingredients arrive and are cooked fresh on the calendar day.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Story Milestone Counters ─── */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-white/10"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-colors"
            >
              <span className="font-oswald text-4xl sm:text-5xl font-black text-[#36D068] block tracking-tight mb-2">
                {stat.value}
              </span>
              <h4 className="font-oswald text-base sm:text-lg font-bold uppercase tracking-tight text-white mb-1">
                {stat.label}
              </h4>
              <p className="text-white/60 text-xs font-light">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

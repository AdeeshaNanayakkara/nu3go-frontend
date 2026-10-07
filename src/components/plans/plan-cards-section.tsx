"use client";

import { useEffect, useRef } from "react";
import { Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function PlanCardsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="plans-intro"
      className="relative w-full pt-6 pb-12 sm:py-16 mt-4 sm:-mt-10 lg:mt-2 xl:mt-4 z-30 overflow-visible select-none bg-[#F7F6F2] text-neutral-900"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-[#15803D] mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#2EB959]" />
          <span className="font-oswald text-xs font-bold tracking-widest uppercase">
            CALIBRATED MEAL TIERS
          </span>
        </div>

        {/* Title */}
        <h2 className="font-oswald text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-neutral-900 tracking-tight leading-tight mb-4">
          CHOOSE YOUR TARGET <span className="text-[#2EB959]">NUTRITION GOAL</span>
        </h2>

        {/* Description */}
        <p className="text-neutral-600 text-sm sm:text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto mb-8">
          Every Nu3Go meal plan is scientifically formulated around distinct metabolic objectives.
          Choose your dedicated tier below, select your preferred schedule (Monthly, Weekly, or Hybrid Fuel),
          and enjoy freshly prepared, chef-crafted breakfast delivered straight to your doorstep every weekday morning.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-neutral-700 bg-white py-4 px-6 sm:px-8 rounded-2xl border border-neutral-200 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2EB959]" />
            <span>100% Chef-Cooked Fresh Daily</span>
          </div>
          <div className="hidden sm:block text-neutral-300">•</div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2EB959]" />
            <span>Missed Meals To Credit</span>
          </div>
        </div>
      </div>
    </section>
  );
}

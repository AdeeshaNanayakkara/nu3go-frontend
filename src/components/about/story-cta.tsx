"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sunrise, ShieldCheck, Zap, RefreshCw, Truck, UtensilsCrossed } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function StoryCta() {
  const containerRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardRef.current,
              start: "top 85%",
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
      className="relative bg-[#F7F6F2] pb-24 sm:pb-32 overflow-hidden text-neutral-900"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12">
        <div
          ref={cardRef}
          className="relative bg-gradient-to-br from-neutral-950 via-neutral-900 to-black rounded-3xl p-8 sm:p-14 lg:p-16 text-white shadow-2xl border border-white/10 overflow-hidden"
        >
          {/* Radiant Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#36D068]/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Epilogue Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#36D068]/20 border border-[#36D068]/40 mb-6">
              <Sunrise className="w-3.5 h-3.5 text-[#36D068]" />
              <span className="font-oswald text-xs font-bold tracking-[0.2em] uppercase text-[#36D068]">
                START YOUR MORNINGS RIGHT
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.08] mb-6">
              Join Sri Lanka&apos;s <span className="text-[#36D068]">#1</span> <br />
              Breakfast Subscription Service.
            </h2>

            {/* Subtitle */}
            <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10 font-light">
              Choose your weekly or monthly subscription today. Enjoy chef-prepared, ready-to-eat breakfasts
              delivered right to your doorstep or office across Colombo and Wattala by <strong>7:30 AM every Monday to Friday</strong>—with 100% free delivery.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-10 text-xs sm:text-sm text-neutral-300 font-medium">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <Truck className="w-4 h-4 text-[#36D068]" />
                <span>Delivered by 7:30 AM Sharp</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <RefreshCw className="w-4 h-4 text-[#36D068]" />
                <span>Swap Meals Anytime</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                <ShieldCheck className="w-4 h-4 text-[#36D068]" />
                <span>100% Free Shipping (Colombo &amp; Wattala)</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link
                href="/plans"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full font-oswald text-sm sm:text-base font-bold uppercase tracking-[0.15em] bg-[#36D068] text-neutral-950 hover:bg-emerald-400 transition-all duration-300 shadow-xl shadow-[#36D068]/25 group hover:scale-105"
              >
                <span>Choose Your Breakfast Plan</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-oswald text-sm sm:text-base font-bold uppercase tracking-[0.15em] text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 backdrop-blur-sm"
              >
                <UtensilsCrossed className="w-4 h-4 text-[#36D068]" />
                <span>View Rotating Menus</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

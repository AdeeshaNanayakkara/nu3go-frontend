"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Handshake, Users, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AboutPartnership() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { opacity: 0, y: 30 },
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#F7F6F2] py-20 sm:py-28 overflow-hidden border-t border-neutral-300/70 text-neutral-900"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12">
        <div
          ref={contentRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
        >
          {/* ─── Left Column: Tagline & Headline ─── */}
          <div className="lg:col-span-5 flex flex-col">
            <span className="font-oswald text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#36D068] mb-2 sm:mb-3">
              JOIN THE MOVEMENT
            </span>
            <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl font-black uppercase text-neutral-900 tracking-tight leading-[1.1]">
              PARTNERSHIP & CORPORATE WELLNESS
            </h2>
          </div>

          {/* ─── Right Column: Description & Action Button ─── */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
              Whether you are looking to fuel your workplace with healthy executive meal stipends, partner your fitness center with customized member nutrition, or explore regional catering collaborations, Nu3Go delivers turnkey culinary excellence.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-oswald text-sm font-bold uppercase tracking-[0.15em] bg-[#121212] text-white hover:bg-[#36D068] hover:text-black transition-all duration-300 shadow-lg hover:shadow-[#36D068]/20 group"
              >
                <span>Partner With Us</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/plans"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-oswald text-sm font-bold uppercase tracking-[0.15em] text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-300/80 transition-colors shadow-sm"
              >
                <span>Explore Meal Plans</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

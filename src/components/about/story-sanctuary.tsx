"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Truck, Wallet, RefreshCw, MapPin, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
  { value: "5,000+", label: "Meals Delivered", sub: "Across Colombo & Wattala" },
  { value: "100%", label: "Fresh Daily Ingredients", sub: "Prepared fresh every morning" },
  { value: "4", label: "Curated Meal Plans", sub: "Designed for different lifestyles" },
  { value: "Free", label: "Standard Delivery", sub: "No hidden delivery fees" },
];

export function StorySanctuary() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
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

      // 3. Cards entrance
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 35, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // 4. Stats entrance
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
          alt="Nu3Go Service Commitment and Policy Background"
          fill
          quality={95}
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark Film Noir Overlay */}
        <div className="absolute inset-0 bg-neutral-950/88 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 w-full relative z-10">
        {/* ─── Subtitle Badge & Header ─── */}
        <div ref={contentRef} className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#36D068]/20 border border-[#36D068]/40 mb-4">
            <span className="font-oswald text-xs font-bold tracking-[0.2em] uppercase text-[#36D068]">
              TERMS &amp; CONDITIONS
            </span>
          </div>

          <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.08] mb-5">
            YOUR <span className="text-[#36D068]">NU3GO</span> EXPERIENCE, <br className="hidden sm:inline" />
            OUR COMMITMENT
          </h2>

          <p className="text-white/80 text-base sm:text-lg leading-relaxed font-light">
            Here&apos;s everything you need to know about our delivery and service policies.
          </p>
        </div>

        {/* ─── 4 Policy Cards Grid ─── */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-20">
          {/* Card 1: Delivery Schedule */}
          <div className="bg-neutral-900/80 backdrop-blur-md p-7 sm:p-9 rounded-3xl border border-white/10 hover:border-[#36D068]/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#36D068]/20 flex items-center justify-center text-[#36D068] shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold font-oswald tracking-widest uppercase text-[#36D068] block">
                    SERVICE SCHEDULE
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
                    Delivery Schedule
                  </h3>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-white/85 font-light">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-0.5" />
                  <span>Deliveries are made <strong>Monday to Friday</strong>, excluding public and mercantile holidays.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-0.5" />
                  <span>Our delivery window is between <strong className="text-[#36D068]">6:30 AM and 9:00 AM</strong>, with a target of completing deliveries by <strong className="text-white">8:30 AM</strong>.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-oswald uppercase text-neutral-400">
              Colombo &amp; Wattala Service Areas
            </div>
          </div>

          {/* Card 2: Cancellations & Wallet Credits */}
          <div className="bg-neutral-900/80 backdrop-blur-md p-7 sm:p-9 rounded-3xl border border-white/10 hover:border-[#36D068]/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold font-oswald tracking-widest uppercase text-emerald-400 block">
                    REFUND POLICY
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
                    Cancellations &amp; Wallet Credits
                  </h3>
                </div>
              </div>

              <p className="text-xs text-white/70 mb-4 leading-relaxed font-light">
                All eligible cancellations are compensated through nu3go wallet credits. Cash or bank refunds are not provided under this policy.
              </p>

              {/* Tiered credit table */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-[#36D068]/20 text-[#36D068] font-semibold font-oswald text-[12px]">
                    Before 6:00 PM (previous day)
                  </span>
                  <span className="font-bold text-white text-[11px] sm:text-xs">
                    100% of meal value credited
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 font-semibold font-oswald text-[12px]">
                    6:00 PM – 11:59 PM (previous day)
                  </span>
                  <span className="font-bold text-white text-[11px] sm:text-xs">
                    50% of meal value credited
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 font-semibold font-oswald text-[12px]">
                    After midnight on delivery day
                  </span>
                  <span className="font-bold text-white/60 text-[11px] sm:text-xs">
                    No credit will be provided
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-oswald uppercase text-neutral-400">
              Automatic Wallet Credits
            </div>
          </div>

          {/* Card 3: Meal Changes */}
          <div className="bg-neutral-900/80 backdrop-blur-md p-7 sm:p-9 rounded-3xl border border-white/10 hover:border-[#36D068]/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold font-oswald tracking-widest uppercase text-teal-400 block">
                    MEAL SWAPPING
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
                    Meal Changes
                  </h3>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-white/85 font-light">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-0.5" />
                  <span>Replacement Meal must be requested <strong className="text-white">before 6:00 PM</strong> on the previous day.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-0.5" />
                  <span>Swap scheduled dishes with optional alternative menu selections tailored to your subscription tier.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-oswald uppercase text-neutral-400">
              Cut-off: 6:00 PM Prior Day
            </div>
          </div>

          {/* Card 4: Delivery Address Changes */}
          <div className="bg-neutral-900/80 backdrop-blur-md p-7 sm:p-9 rounded-3xl border border-white/10 hover:border-[#36D068]/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold font-oswald tracking-widest uppercase text-cyan-400 block">
                    HYBRID WORK ROUTINES
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
                    Delivery Address Changes
                  </h3>
                </div>
              </div>

              <ul className="space-y-4 text-sm text-white/85 font-light">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-0.5" />
                  <span>Customers may change their delivery address if the new location is within <strong className="text-[#36D068]">nu3go&apos;s service coverage area</strong> (Colombo and Wattala).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-0.5" />
                  <span>Address changes must be submitted <strong className="text-white">before 6:00 PM</strong> on the previous day.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs font-oswald uppercase text-neutral-400">
              Home &bull; Office &bull; Co-Working
            </div>
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

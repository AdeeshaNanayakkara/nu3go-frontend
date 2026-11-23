"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  Sunrise,
  Flame,
  PackageCheck,
  Truck,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TIMELINE_STEPS = [
  {
    time: "03:30 AM",
    icon: Sunrise,
    accent: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    badge: "STAGE 01 // FRESH ARRIVAL",
    title: "Fresh Ingredient Washing & Preparation",
    desc: "Every morning starts with fresh ingredients arriving at our kitchen. Vegetables, fruits and other raw ingredients are carefully inspected, washed and cleaned before preparation begins. We prepare fresh each day rather than relying on pre-cooked meals from previous days.",
    image: "/images/insta-1.jpg",
    metric: "FRESH INGREDIENTS • DAILY PREPARATION",
  },
  {
    time: "04:30 AM",
    icon: Flame,
    accent: "text-orange-500 bg-orange-500/10 border-orange-500/30",
    badge: "STAGE 02 // CHEF PREPARATION",
    title: "Freshly Cooked, Every Morning",
    desc: "Our kitchen team prepares each meal fresh in daily batches using carefully selected ingredients and standardised recipes. From wholesome everyday favourites to protein-rich meals, every portion is prepared with attention to taste, quality and consistency.",
    image: "/images/how-to-work.jpg",
    metric: "FRESH DAILY COOKING • PORTION CONTROL",
  },
  {
    time: "05:45 AM",
    icon: PackageCheck,
    accent: "text-[#36D068] bg-[#36D068]/10 border-[#36D068]/30",
    badge: "STAGE 03 // QUALITY & PACKAGING",
    title: "Packed Fresh. Ready to Enjoy.",
    desc: "Once prepared, every meal is portioned, checked and packed in food-grade containers designed for safe and convenient handling. Each order is carefully organised to maintain food quality and make your meals easy to enjoy at home or at work.",
    image: "/images/hero-bg-4.jpeg",
    metric: "FOOD-GRADE PACKAGING • QUALITY CHECKS",
  },
  {
    time: "06:30 AM",
    icon: Truck,
    accent: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    badge: "STAGE 04 // DELIVERY DISPATCH",
    title: "Packed & Out for Delivery",
    desc: "Every order is organised according to its delivery zone and dispatched through our morning delivery network. Our delivery team follows planned routes across our service areas to get your meals to the right doorstep or workplace on time.",
    image: "/images/contact-hero-bg.jpg",
    metric: "ZONE-BASED DISPATCH • FREE STANDARD DELIVERY",
  },
  {
    time: "BY 07:30 AM",
    icon: UtensilsCrossed,
    accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    badge: "STAGE 05 // AT YOUR DOORSTEP",
    title: "Your Meals. Your Routine. Simplified.",
    desc: "Your freshly prepared meals arrive at your home or workplace, ready to enjoy. Whether you're getting ready for work, starting your day at the office or managing a busy routine, nu3go makes eating well one less thing to worry about.",
    image: "/images/hero-dish.png",
    metric: "CONVENIENT HOME & OFFICE DELIVERY",
  },
];

export function StoryJourney() {
  const containerRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
            },
          }
        );
      }

      if (timelineRef.current) {
        const items = timelineRef.current.querySelectorAll(".timeline-card");
        items.forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: 40, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: item,
                start: "top 80%",
              },
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative bg-[#F7F6F2] py-20 sm:py-28 lg:py-32 overflow-hidden text-neutral-900"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* ─── Subtitle Badge & Header ─── */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#36D068]/15 border border-[#36D068]/30 mb-4">
            <Clock className="w-3.5 h-3.5 text-[#36D068]" />
            <span className="font-oswald text-xs font-bold tracking-[0.2em] uppercase text-emerald-800">
              HOW nu3go WORKS
            </span>
          </div>

          <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-neutral-900 leading-[1.08] mb-5">
            FROM FRESH INGREDIENTS <br className="hidden sm:inline" />
            <span className="text-[#36D068]">TO YOUR DOORSTEP.</span>
          </h2>

          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed font-normal">
            Every meal has a process behind it. From sourcing fresh ingredients to preparing,
            packing and delivering your meals, we focus on freshness, quality and convenience at every step.
          </p>
        </div>

        {/* ─── The Story Timeline ─── */}
        <div ref={timelineRef} className="relative max-w-5xl mx-auto">
          {/* Vertical Connecting Center Line on Desktop */}
          <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-neutral-300/80 -translate-x-1/2" />

          <div className="space-y-12 sm:space-y-16">
            {TIMELINE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={step.title}
                  className={`timeline-card relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                    isEven ? "md:text-right" : "md:flex-row-reverse md:text-left"
                  }`}
                >
                  {/* Center Node on Desktop */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-4 border-[#36D068] items-center justify-center shadow-lg z-20">
                    <Clock className="w-4 h-4 text-neutral-800" />
                  </div>

                  {/* Text Column */}
                  <div className={`${isEven ? "md:pr-12 lg:pr-16" : "md:order-2 md:pl-12 lg:pl-16"}`}>
                    <div className="bg-white p-7 sm:p-9 rounded-3xl shadow-xl shadow-neutral-900/5 border border-neutral-200/80 relative overflow-hidden group">
                      <div className="flex items-center gap-3 mb-4 justify-start md:justify-start">
                        <div className={`p-2.5 rounded-xl border ${step.accent}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="font-oswald text-xs font-bold tracking-widest uppercase text-neutral-400 block">
                            {step.badge}
                          </span>
                          <span className="font-oswald text-base font-black text-[#36D068]">
                            {step.time}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-neutral-900 tracking-tight mb-3 text-left">
                        {step.title}
                      </h3>

                      <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed text-left font-normal">
                        {step.desc}
                      </p>

                      <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-left">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-oswald">
                          Standard
                        </span>
                        <span className="text-xs font-bold font-oswald uppercase text-[#36D068] bg-[#36D068]/10 px-2.5 py-1 rounded-full">
                          {step.metric}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Preview Card */}
                  <div className={`${isEven ? "md:pl-12 lg:pl-16" : "md:order-1 md:pr-12 lg:pr-16"}`}>
                    <div className="relative w-full h-56 sm:h-64 lg:h-72 rounded-3xl overflow-hidden shadow-xl border border-neutral-200/80 group">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 45vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/40 shadow-sm flex items-center justify-between">
                        <span className="font-oswald text-xs font-bold uppercase text-neutral-900 tracking-wide">
                          {step.title}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-[#36D068]" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

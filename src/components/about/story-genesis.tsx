"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Compass, XCircle, CheckCircle2, Quote, Heart, MapPin, Truck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function StoryGenesis() {
  const containerRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const contrastRef = useRef<HTMLDivElement | null>(null);
  const founderCardRef = useRef<HTMLDivElement | null>(null);

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

      if (contrastRef.current) {
        gsap.fromTo(
          contrastRef.current.children,
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: contrastRef.current,
              start: "top 80%",
            },
          }
        );
      }

      if (founderCardRef.current) {
        gsap.fromTo(
          founderCardRef.current,
          { opacity: 0, y: 45 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: founderCardRef.current,
              start: "top 80%",
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
      className="relative bg-[#F7F6F2] pt-12 sm:pt-16 lg:pt-20 pb-20 sm:pb-28 overflow-hidden text-neutral-900"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* ─── Subtitle Badge & Header ─── */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#36D068]/15 border border-[#36D068]/30 mb-4">
            <Compass className="w-3.5 h-3.5 text-[#36D068]" />
            <span className="font-oswald text-xs font-bold tracking-[0.2em] uppercase text-emerald-800">
              OUR PURPOSE
            </span>
          </div>

          <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight text-neutral-900 leading-[1.04] mb-5">
            BUILDING SRI LANKA&apos;S <span className="text-[#36D068]">#1</span> <br className="hidden sm:inline" />
            BREAKFAST SUBSCRIPTION <br className="hidden sm:inline" />
            SERVICE.
          </h2>

          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed font-normal">
            <strong className="text-neutral-900 font-semibold">nu3go</strong> was built with a clear purpose:
            to solve the weekday morning rush for busy professionals and health-conscious individuals across
            the <strong className="text-neutral-900 font-semibold">Colombo and Wattala areas</strong>, delivering nutritional,
            ready-to-eat breakfasts directly to doorsteps or offices by <strong className="text-neutral-900 font-semibold">7:30 AM every weekday morning (Monday to Friday)</strong>.
          </p>
        </div>

        {/* ─── The Contrast: The Morning Dilemma vs nu3go ─── */}
        <div ref={contrastRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-16 sm:mb-24">
          {/* Card 1: The Weekday Morning Dilemma */}
          <div className="relative bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-3xl border border-red-200/70 shadow-xl shadow-red-500/5 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 to-rose-500" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-widest text-red-600 uppercase font-oswald block">
                  THE WORKDAY MORNING RUSH
                </span>
                <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-neutral-900">
                  The Sri Lankan Breakfast Struggle
                </h3>
              </div>
            </div>

            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              Between chaotic morning commutes and early office hours, preparing a nutritious breakfast
              takes time most people simply do not have. The result? Unhealthy compromises every single morning.
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-neutral-700">
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-0.5 font-bold">&#10005;</span>
                <span>Skipping breakfast entirely or settling for sugary tea and oily bakery short-eats.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-0.5 font-bold">&#10005;</span>
                <span>Heavy, unmeasured carbohydrates that cause severe afternoon energy crashes and brain fog.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-500 mt-0.5 font-bold">&#10005;</span>
                <span>Wasting precious evening hours cooking bland food in repetitive plastic containers.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: The nu3go Solution */}
          <div className="relative bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-3xl border border-[#36D068]/50 shadow-2xl shadow-emerald-500/10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#36D068] to-emerald-600" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#36D068]/20 flex items-center justify-center text-[#36D068] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-widest text-[#36D068] uppercase font-oswald block">
                  THE nu3go PROMISE
                </span>
                <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-neutral-900">
                  Ready-To-Eat Nutritional Mornings
                </h3>
              </div>
            </div>

            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              We deliver fresh, chef-prepared breakfasts directly to your home doorstep or office desk across
              Colombo &amp; Wattala by 7:30 AM every weekday morning (Monday to Friday)—with 100% free delivery.
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-neutral-700">
              <li className="flex items-start gap-2.5">
                <span className="text-[#36D068] mt-0.5 font-bold">&#10003;</span>
                <span><strong>Rotating Healthy Menu:</strong> Overnight oats, high-protein pasta, omelets, sandwiches, and traditional chapathi or stringhopper packs.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#36D068] mt-0.5 font-bold">&#10003;</span>
                <span><strong>Flexible Hybrid Subscriptions:</strong> Weekly or monthly plans with the freedom to swap meals from alternative choices.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#36D068] mt-0.5 font-bold">&#10003;</span>
                <span><strong>100% Free Delivery:</strong> Standard weekday delivery directly to your door with zero hidden fees.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── Founder Story Vignette ─── */}
        <div
          ref={founderCardRef}
          className="relative bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white p-8 sm:p-12 lg:p-14 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#36D068]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Founder Photo & Title */}
            <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden ring-4 ring-[#36D068]/30 shadow-2xl mb-4 group">
                <Image
                  src="/images/about-founder.jpg"
                  alt="Mr. Abishake - Founder of nu3go"
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="144px"
                />
              </div>
              <h4 className="font-oswald text-2xl font-bold uppercase tracking-tight text-white">
                Mr. Abishake
              </h4>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#36D068] mt-1">
                Founder, nu3go
              </p>
              <div className="inline-flex items-center gap-1.5 mt-3 text-neutral-400 text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#36D068]" />
                <span>Serving Colombo &amp; Wattala</span>
              </div>
            </div>

            {/* Right Column: Founder's Personal Words */}
            <div className="lg:col-span-8 flex flex-col justify-center">
              <Quote className="w-10 h-10 text-[#36D068]/40 mb-3" />
              <blockquote className="font-oswald text-xl sm:text-2xl md:text-3xl font-light text-white/95 leading-snug tracking-wide italic mb-5">
                &ldquo;We created nu3go to eliminate morning stress completely. Starting your workday nourished shouldn&apos;t require waking up at 5:00 AM to cook or settling for oily street snacks. Good nutrition should be as effortless as opening your door.&rdquo;
              </blockquote>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
                Today, nu3go powers hundreds of busy professionals, fitness enthusiasts, and families every Monday to Friday
                with chef-prepared, macro-balanced breakfasts delivered fresh and ready to eat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

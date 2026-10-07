"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lottie } from "lottie-react";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StepItem {
  src: string;
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
}

const STEPS: StepItem[] = [
  {
    src: "/lottie/how-it-works-1.json",
    title: "Subscribe",
    description: "Choose your weekly hybrid and monthly plan in just one click.",
    actionText: "SUBSCRIBE",
    actionHref: "/subscription",
  },
  {
    src: "/lottie/how-it-works-2.json",
    title: "We Prepare",
    description: "Your breakfast is freshly prepared every morning by passionate chefs.",
    actionText: "WE PREPARE",
    actionHref: "/menu",
  },
  {
    src: "/lottie/how-it-works-3.json",
    title: "We Deliver",
    description: "We deliver it straight to your doorstep hot & on schedule.",
    actionText: "LOCATIONS",
    actionHref: "/locations",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bgImgRef = useRef<HTMLDivElement | null>(null);
  const titleLinesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const stepCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ─── 1. Background Parallax on Scroll ───
      if (bgImgRef.current) {
        gsap.fromTo(
          bgImgRef.current,
          { yPercent: -8 },
          {
            yPercent: 8,
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

      // ─── 2. Clean Synchronized Entrance Timeline on Scroll / Load ───
      const validTitleLines = titleLinesRef.current.filter(Boolean);
      const validCards = stepCardsRef.current.filter(Boolean);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
        defaults: { ease: "power3.out" },
      });

      // Title lines stagger in from left with fade
      if (validTitleLines.length > 0) {
        tl.fromTo(
          validTitleLines,
          { opacity: 0, x: -45, filter: "blur(4px)" },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 0.85,
            stagger: 0.12,
          }
        );
      }

      // Subtitle fade in
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5"
        );
      }

      // Step cards staggered slide up
      if (validCards.length > 0) {
        tl.fromTo(
          validCards,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.16,
          },
          "-=0.5"
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 sm:py-28 lg:py-32 bg-neutral-950 overflow-hidden select-none"
    >
      {/* ─── Background Image with Clean Dark Overlay & Smooth Parallax ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          ref={bgImgRef}
          className="relative w-full h-[120%] -top-[10%] will-change-transform"
        >
          <Image
            src="/images/how-to-work.jpg"
            alt="How It Works Background"
            fill
            priority={false}
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        {/* Softened Dark overlay ensuring image is vibrant and clearly visible */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
      </div>

      {/* ─── Content Container ─── */}
      <div className="relative z-10 max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 xl:gap-8 items-stretch">
          {/* ─── Column 1: Section Title & Subtitle ─── */}
          <div className="flex flex-col text-center md:text-left items-center md:items-start justify-center py-4">
            <h2 className="font-oswald text-4xl sm:text-5xl lg:text-[46px] xl:text-[52px] font-black uppercase text-white leading-[1.05] tracking-tight flex flex-col items-center md:items-start">
              {["HOW", "IT", "WORKS"].map((word, i) => (
                <span
                  key={word}
                  ref={(el) => {
                    titleLinesRef.current[i] = el;
                  }}
                  className="inline-block will-change-[transform,opacity]"
                >
                  {word}
                </span>
              ))}
            </h2>
            <p
              ref={subtitleRef}
              className="text-neutral-300 text-sm sm:text-base leading-relaxed mt-4 max-w-xs font-light will-change-[transform,opacity] mx-auto md:mx-0"
            >
              Fresh, chef-crafted balanced meals prepared with passion and delivered seamlessly to fuel your active lifestyle.
            </p>
          </div>

          {/* ─── Columns 2, 3, 4: Interactive Hover Step Cards with Animated DailyGrubs Icons ─── */}
          {STEPS.map((step, idx) => {
            return (
              <div
                key={idx}
                ref={(el) => {
                  stepCardsRef.current[idx] = el;
                }}
                className="group relative flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-[#36D068]/40 hover:shadow-2xl hover:shadow-[#36D068]/20 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-2.5 h-full justify-between will-change-[transform,opacity] cursor-pointer"
              >
                <div className="flex flex-col items-center w-full">
                  {/* Animated Lottie Icon from DailyGrubs with Soft Circular Glow */}
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
                    {/* Ambient Glow */}
                    <div className="absolute inset-2 bg-gradient-to-tr from-[#36D068]/20 via-emerald-400/15 to-transparent rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                    
                    {/* Lottie Animation Display */}
                    <div className="relative w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      {isMounted && (
                        <Lottie
                          src={step.src}
                          loop
                          autoplay
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  </div>

                  {/* Step Title */}
                  <div className="min-h-[48px] flex items-center justify-center mt-4 mb-2">
                    <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-white tracking-wide group-hover:text-[#36D068] transition-colors duration-300">
                      {step.title}
                    </h3>
                  </div>

                  {/* Step Description */}
                  <div className="flex items-start justify-center">
                    <p className="text-neutral-300 group-hover:text-neutral-200 text-sm sm:text-base leading-relaxed font-light max-w-[260px] transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* CTA Action Link */}
                <Link
                  href={step.actionHref}
                  className="mt-6 inline-flex items-center gap-2 font-oswald text-xs sm:text-sm font-semibold tracking-widest uppercase text-white/80 group-hover:text-[#36D068] transition-all duration-300"
                >
                  <span>{step.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5 text-[#36D068]" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

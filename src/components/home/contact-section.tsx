"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ContactSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const tagRef = useRef<HTMLSpanElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const btnRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ─── 1. Main Synchronized Entrance Timeline ───
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 82%",
          toggleActions: "play none none none",
          once: true,
        },
        defaults: { ease: "power2.out", force3D: true },
      });

      if (tagRef.current) {
        entranceTl.fromTo(
          tagRef.current,
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, duration: 0.7 }
        );
      }

      if (headingRef.current) {
        entranceTl.fromTo(
          headingRef.current,
          { opacity: 0, y: 32, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out" },
          "-=0.45"
        );
      }

      if (descRef.current) {
        entranceTl.fromTo(
          descRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.55"
        );
      }

      if (btnRef.current) {
        entranceTl.fromTo(
          btnRef.current,
          { opacity: 0, y: 20, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: "back.out(1.4)" },
          "-=0.5"
        );
      }

      // ─── 2. Smooth Up/Down Scroll Parallax Scrub ───
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
          { yPercent: 4 },
          {
            yPercent: -4,
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

      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { yPercent: -4 },
          {
            yPercent: 4,
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#F7F6F2] py-20 sm:py-24 lg:py-28 select-none overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ─── Left Column: Tag & Main Heading ─── */}
          <div
            ref={leftColRef}
            className="flex flex-col items-center lg:items-start text-center lg:text-left will-change-transform"
          >
            <span
              ref={tagRef}
              className="font-oswald text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#36D068] mb-3 flex items-center justify-center lg:justify-start gap-1.5 will-change-[transform,opacity]"
            >
              <MessageSquare className="w-4 h-4 text-[#36D068]" />
              GET IN TOUCH
            </span>

            <h2
              ref={headingRef}
              className="font-oswald text-4xl sm:text-5xl lg:text-6xl font-black uppercase text-neutral-900 tracking-tight leading-[1.05] will-change-[transform,opacity]"
            >
              HAVE QUESTIONS? <br />
              LET&apos;S CONNECT
            </h2>
          </div>

          {/* ─── Right Column: Description & Action Button ─── */}
          <div
            ref={rightColRef}
            className="flex flex-col items-center lg:items-start text-center lg:text-left lg:pl-4 will-change-transform"
          >
            <p
              ref={descRef}
              className="text-neutral-600 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 font-normal max-w-xl mx-auto lg:mx-0 will-change-[transform,opacity]"
            >
              Whether you need guidance choosing the right meal plan, customized nutrition advice, corporate catering, or delivery schedule support across our Colombo kitchen hubs, our wellness team is here for you.
            </p>

            <Link
              ref={btnRef}
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#36D068] text-[#36D068] hover:bg-[#36D068] hover:text-white px-8 py-3.5 font-oswald text-xs sm:text-sm font-bold tracking-[0.15em] uppercase transition-colors duration-300 hover:shadow-lg hover:shadow-[#36D068]/20 group w-full sm:w-auto will-change-[transform,opacity]"
            >
              <span>GET IN TOUCH</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

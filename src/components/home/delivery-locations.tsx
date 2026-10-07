"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { zoneService, type ZoneItem } from "@/services/api/zone.service";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Fallback zones in case backend is loading or unavailable
const FALLBACK_ZONES: ZoneItem[] = [
  { id: "1", name: "Colombo 01 - Fort" },
  { id: "2", name: "Slave Island" },
  { id: "3", name: "Kollupitiya" },
  { id: "4", name: "Bambalapitiya" },
  { id: "5", name: "Havelock Town" },
  { id: "6", name: "Wellawatte" },
  { id: "7", name: "Cinnamon Gardens" },
  { id: "8", name: "Borella" },
  { id: "9", name: "Rajagiriya" },
  { id: "10", name: "Nugegoda" },
  { id: "11", name: "Mount Lavinia" },
  { id: "12", name: "Dehiwala" },
];

export function DeliveryLocations() {
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const isHoveredRef = useRef(false);
  const [, setHoverState] = useState(false);

  // ─── Fetch Dynamic Zones from API ───
  useEffect(() => {
    let isMounted = true;

    async function loadZones() {
      try {
        const data = await zoneService.getZones();
        if (isMounted) {
          if (data && data.length > 0) {
            setZones(data);
          } else {
            setZones(FALLBACK_ZONES);
          }
        }
      } catch (err) {
        console.error("[DeliveryLocations] Failed to fetch dynamic zones:", err);
        if (isMounted) setZones(FALLBACK_ZONES);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadZones();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Compute Repeated List for Seamless Infinite Looping ───
  const duplicatedZones = useMemo(() => {
    const list = zones.length > 0 ? zones : FALLBACK_ZONES;
    // Repeat to ensure at least 12 cards for a wide marquee track
    const multiplier = Math.max(2, Math.ceil(12 / list.length));
    const repeated = Array.from({ length: multiplier }, () => list).flat();
    return [...repeated, ...repeated];
  }, [zones]);

  // ─── GSAP Entrance & Infinite Horizontal Loop ───
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Header & Carousel Entrance Timeline
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 82%",
          toggleActions: "play none none none",
          once: true,
        },
        defaults: { ease: "power2.out" },
      });

      if (tagRef.current) {
        entranceTl.fromTo(
          tagRef.current,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.7 }
        );
      }

      if (titleRef.current) {
        entranceTl.fromTo(
          titleRef.current,
          { opacity: 0, y: 28, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8 },
          "-=0.4"
        );
      }

      if (descRef.current) {
        entranceTl.fromTo(
          descRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        );
      }

      if (carouselContainerRef.current) {
        entranceTl.fromTo(
          carouselContainerRef.current,
          { opacity: 0, y: 35, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9 },
          "-=0.4"
        );
      }

      // 2. Infinite Seamless Horizontal Marquee Loop
      const track = trackRef.current;
      if (track && duplicatedZones.length > 0) {
        gsap.set(track, { xPercent: 0 });

        const loopTween = gsap.to(track, {
          xPercent: -50,
          ease: "none",
          duration: Math.max(25, duplicatedZones.length * 1.6),
          repeat: -1,
        });

        tweenRef.current = loopTween;

        // 3. Dynamic Up & Down Page Scroll Speed Response
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            if (!tweenRef.current || isHoveredRef.current) return;
            const velocity = self.getVelocity();
            const targetScale = Math.max(0.3, Math.min(3.5, 1 + Math.abs(velocity) / 450));
            gsap.to(tweenRef.current, {
              timeScale: targetScale,
              duration: 0.3,
              overwrite: "auto",
              onComplete: () => {
                if (!isHoveredRef.current && tweenRef.current) {
                  gsap.to(tweenRef.current, {
                    timeScale: 1,
                    duration: 0.8,
                    ease: "power2.out",
                  });
                }
              },
            });
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [duplicatedZones]);

  // Smooth deceleration on hover / acceleration on leave
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    setHoverState(true);
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 0, duration: 0.4, ease: "power1.out" });
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    setHoverState(false);
    if (tweenRef.current) {
      gsap.to(tweenRef.current, { timeScale: 1, duration: 0.4, ease: "power1.inOut" });
    }
  };

  // Step navigate left or right on arrow button click
  const handleArrowClick = (direction: "left" | "right") => {
    const tween = tweenRef.current;
    if (!tween || duplicatedZones.length === 0) return;

    const currentProgress = tween.progress();
    const step = 1 / duplicatedZones.length;
    let targetProgress = direction === "right" ? currentProgress + step : currentProgress - step;

    // Wrap progress between 0 and 1
    if (targetProgress < 0) targetProgress += 1;
    if (targetProgress > 1) targetProgress -= 1;

    gsap.to(tween, {
      progress: targetProgress,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-white pt-0 sm:pt-2 lg:pt-4 pb-20 sm:pb-24 lg:pb-28 select-none overflow-hidden font-poppins"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── Section Header ─── */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span
            ref={tagRef}
            className="font-oswald text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#36D068] mb-3 flex items-center gap-1.5 will-change-[transform,opacity]"
          >
            <MapPin className="w-4 h-4 text-[#36D068]" />
            OUR DELIVERY LOCATIONS
          </span>

          <h2
            ref={titleRef}
            className="font-oswald text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-neutral-900 tracking-tight leading-[1.08] mb-4 will-change-[transform,opacity]"
          >
            FIND NU3GO NEAR YOU
          </h2>

          <p
            ref={descRef}
            className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-normal will-change-[transform,opacity]"
          >
            Freshly prepared balanced meals delivered on schedule every morning across our dedicated metropolitan kitchen hubs.
          </p>
        </div>

        {/* ─── GSAP Infinite Auto-Sliding Loop with Dynamic Zones ─── */}
        <div
          ref={carouselContainerRef}
          className="relative group w-full overflow-hidden will-change-[transform,opacity]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left / Right Edge Gradient Masks for Smooth Fade */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none" />

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleArrowClick("left")}
            aria-label="Previous locations"
            className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-neutral-200 shadow-2xl shadow-neutral-900/20 text-neutral-800 flex items-center justify-center transition-all duration-300 hover:bg-[#36D068] hover:text-white hover:border-[#36D068] hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleArrowClick("right")}
            aria-label="Next locations"
            className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-neutral-200 shadow-2xl shadow-neutral-900/20 text-neutral-800 flex items-center justify-center transition-all duration-300 hover:bg-[#36D068] hover:text-white hover:border-[#36D068] hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* GSAP Looping Horizontal Track */}
          <div
            ref={trackRef}
            className="flex flex-row items-stretch gap-6 sm:gap-8 py-6 w-max will-change-transform"
          >
            {duplicatedZones.map((zone, index) => (
              <div
                key={`${zone.id}-${index}`}
                className="shrink-0 w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] flex flex-col items-center justify-center text-center p-6 sm:p-7 rounded-2xl bg-neutral-50/80 border border-neutral-100/90 shadow-sm transition-all duration-300 hover:bg-white hover:border-[#36D068]/50 hover:shadow-xl hover:shadow-[#36D068]/15 hover:-translate-y-1 group/card"
              >
                {/* Zone Status Tag */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#36D068]/10 border border-[#36D068]/25 text-[#0B3B17] text-[10px] font-bold font-oswald uppercase tracking-wider mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#36D068] animate-pulse" />
                  <span>ACTIVE DELIVERY ZONE</span>
                </div>

                {/* Zone / City Title */}
                <h3 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-[#0B3B17] group-hover/card:text-[#36D068] tracking-wider transition-colors leading-tight">
                  {zone.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

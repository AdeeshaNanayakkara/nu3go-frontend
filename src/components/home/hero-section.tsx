"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ROUTES } from "@/constants/routes";

const slides = [
  {
    bg: "/images/hero-bg-4.jpeg",
    bgAlt: "Friends dining with fresh healthy bowls",
    dish: "/images/hero-dish.png",
    dishAlt: "Nu3Go Avocado, Chicken & Quinoa Super Bowl",
    name: "Avocado & Quinoa Power Bowl",
  },
  {
    bg: "/images/hero-bg-5.jpeg",
    bgAlt: "Warm chef culinary dining atmosphere",
    dish: "/images/hero-dish2.png",
    dishAlt: "Nu3Go Grilled Salmon & Roasted Asparagus Bowl",
    name: "Atlantic Salmon & Asparagus Plate",
  },
  {
    bg: "/images/hero-bg-1.jpg",
    bgAlt: "Cozy bistro dining setting with wholesome meals",
    dish: "/images/hero-dish3.png",
    dishAlt: "Nu3Go Artisan Roasted Sweet Potato & Chicken Box",
    name: "Artisan Chicken & Sweet Potato Bowl",
  },
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // References for GSAP animations
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const ctaBtn1Ref = useRef<HTMLAnchorElement | null>(null);
  const ctaBtn2Ref = useRef<HTMLAnchorElement | null>(null);
  const indicatorsRef = useRef<HTMLDivElement | null>(null);
  const dishContainerRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<HTMLDivElement | null>(null);

  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dishRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevSlideRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setActiveSlide(index);
  }, []);

  // ─── 1. Initial GSAP Entrance & Ambient Floating Animations ───
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1A. Hero Content Staggered Entrance (using fromTo for 100% reliability in React)
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0 }
        );
      }

      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85 },
          "-=0.7"
        );
      }

      const buttons = [ctaBtn1Ref.current, ctaBtn2Ref.current].filter(Boolean);
      if (buttons.length > 0) {
        tl.fromTo(
          buttons,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.12 },
          "-=0.6"
        );
      }

      if (indicatorsRef.current) {
        tl.fromTo(
          indicatorsRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.4"
        );
      }

      if (dishContainerRef.current) {
        tl.fromTo(
          dishContainerRef.current,
          { scale: 0.8, y: 60, opacity: 0, rotation: -8 },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            rotation: 0,
            duration: 1.2,
            ease: "back.out(1.2)",
          },
          "-=0.8"
        );
      }

      // 1B. Continuous Organic Dish Floating with GSAP
      if (dishContainerRef.current) {
        gsap.to(dishContainerRef.current, {
          y: -14,
          rotation: 1.5,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // 1C. Synchronized Ground Shadow Breathing with GSAP
      if (shadowRef.current) {
        gsap.to(shadowRef.current, {
          scaleX: 0.88,
          scaleY: 0.82,
          opacity: 0.28,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ─── 2. GSAP Slide Cross-Fade & 3D Dish Transition ───
  useEffect(() => {
    const prev = prevSlideRef.current;
    const current = activeSlide;

    if (prev === current && prev === 0) {
      // Initial state setup
      bgRefs.current.forEach((el, idx) => {
        if (el) {
          gsap.set(el, { opacity: idx === 0 ? 0.65 : 0, scale: 1 });
        }
      });
      dishRefs.current.forEach((el, idx) => {
        if (el) {
          gsap.set(el, {
            opacity: idx === 0 ? 1 : 0,
            scale: idx === 0 ? 1 : 0.85,
            rotation: idx === 0 ? 0 : -8,
            pointerEvents: idx === 0 ? "auto" : "none",
            zIndex: idx === 0 ? 10 : 0,
          });
        }
      });
      return;
    }

    const isNext =
      (current > prev && !(prev === 0 && current === slides.length - 1)) ||
      (prev === slides.length - 1 && current === 0);
    const rotationOut = isNext ? -12 : 12;
    const rotationIn = isNext ? 10 : -10;

    // Transition Backgrounds with GSAP
    bgRefs.current.forEach((el, idx) => {
      if (!el) return;
      if (idx === current) {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 1.05 },
          { opacity: 0.65, scale: 1, duration: 1.2, ease: "power2.inOut" }
        );
      } else if (idx === prev) {
        gsap.to(el, { opacity: 0, duration: 1.0, ease: "power2.inOut" });
      } else {
        gsap.set(el, { opacity: 0 });
      }
    });

    // Transition Dishes with GSAP (3D Rotation & Scale)
    dishRefs.current.forEach((el, idx) => {
      if (!el) return;
      if (idx === current) {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.8, rotation: rotationIn, y: 15 },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            y: 0,
            duration: 0.9,
            ease: "back.out(1.3)",
            zIndex: 10,
            pointerEvents: "auto",
          }
        );
      } else if (idx === prev) {
        gsap.to(el, {
          opacity: 0,
          scale: 0.85,
          rotation: rotationOut,
          y: 20,
          duration: 0.6,
          ease: "power2.in",
          zIndex: 0,
          pointerEvents: "none",
        });
      } else {
        gsap.set(el, { opacity: 0, pointerEvents: "none", zIndex: 0 });
      }
    });

    prevSlideRef.current = current;
  }, [activeSlide]);

  // ─── 3. Preload Background & Dish Images in Memory ───
  useEffect(() => {
    if (typeof window !== "undefined") {
      slides.forEach((slide) => {
        const bgImg = new window.Image();
        bgImg.src = slide.bg;
        const dishImg = new window.Image();
        dishImg.src = slide.dish;
      });
    }
  }, []);

  // ─── 4. Auto-Play Timer (Smoothly Pauses on Hover) ───
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  return (
    <section
      ref={sectionRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full min-h-[92vh] lg:min-h-screen bg-[#111111] flex flex-col justify-between overflow-visible select-none"
    >
      {/* ─── Background Carousel with GSAP Cross-Fade ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {slides.map((slide, index) => (
          <div
            key={slide.bg}
            ref={(el) => {
              bgRefs.current[index] = el;
            }}
            className="absolute inset-0 will-change-[opacity,transform]"
          >
            <Image
              src={slide.bg}
              alt={slide.bgAlt}
              fill
              priority={index === 0}
              className="object-cover object-center brightness-95"
              sizes="100vw"
            />
          </div>
        ))}
        {/* Soft Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-[#111111]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/15 to-black/60" />
      </div>

      {/* ─── Hero Content (Centered Headline, Subtitle, Dual CTAs, Slide Indicators) ─── */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 pt-36 sm:pt-44 lg:pt-48 pb-32 sm:pb-40 text-center flex flex-col items-center justify-center my-auto">
        {/* Main Headline in Tall Condensed Oswald Typography */}
        <h1
          ref={headlineRef}
          className="font-oswald text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-extrabold tracking-tight uppercase text-white leading-[1.05] drop-shadow-lg will-change-transform"
        >
          HEALTHY INSIDE, <br />
          <span className="text-white">FRESH OUTSIDE</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mt-5 sm:mt-6 text-white/85 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal tracking-wide drop-shadow-sm will-change-transform"
        >
          Fresh, nutritionally balanced chef-crafted meals delivered directly to your doorstep.
          Tailored healthy nutrition to power your active lifestyle.
        </p>

        {/* Dual Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto">
          {/* Primary CTA (Solid Nu3Go Green) */}
          <Link
            ref={ctaBtn1Ref}
            href={ROUTES.PLANS}
            className="w-full sm:w-auto bg-[#36D068] hover:bg-[#2EB959] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-none font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 shadow-xl shadow-[#36D068]/30 hover:scale-105 active:scale-95 text-center cursor-pointer inline-block"
          >
            SUBSCRIBE NOW
          </Link>

          {/* Secondary CTA (White Outline) */}
          <Link
            ref={ctaBtn2Ref}
            href={ROUTES.MENU}
            className="w-full sm:w-auto border border-white/90 hover:border-[#E11D48] text-white hover:bg-[#E11D48] hover:text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-none font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:shadow-lg hover:shadow-[#36D068]/20 hover:scale-105 active:scale-95 text-center backdrop-blur-xs cursor-pointer inline-block"
          >
            EXPLORE MENU
          </Link>
        </div>

        {/* Slide Indicator Pills */}
        <div ref={indicatorsRef} className="mt-7 sm:mt-8 flex items-center justify-center gap-2.5">
          {slides.map((slide, index) => {
            const isActive = activeSlide === index;
            return (
              <button
                key={slide.name}
                onClick={() => goToSlide(index)}
                className={`group relative h-2 transition-all duration-300 rounded-full cursor-pointer focus:outline-hidden ${
                  isActive
                    ? "w-9 sm:w-11 bg-[#36D068] shadow-md shadow-[#36D068]/50"
                    : "w-2.5 sm:w-3 bg-white/35 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* ─── Bottom Curved SVG Divider & 3D Floating Dish Carousel ─── */}
      <div className="relative w-full z-20">
        {/* Smooth Concave Downward Curved SVG Mask */}
        <div className="w-full overflow-hidden leading-none pointer-events-none -mb-px">
          <svg
            viewBox="0 0 1440 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-16 sm:h-24 md:h-32 lg:h-40 object-cover"
            preserveAspectRatio="none"
          >
            <path d="M0 0 C480 140 960 140 1440 0 V160 H0 Z" fill="#FAFAFA" />
          </svg>
        </div>

        {/* ─── Central 3D Floating Circular Food Dish (GSAP Controlled) ─── */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-30 pointer-events-auto group">
          {/* Stable Static Frame */}
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-88 md:h-88 lg:w-[420px] lg:h-[420px] select-none">
            {/* Dedicated Soft Ground Shadow underneath the 3D plate (GSAP Breathing) */}
            <div
              ref={shadowRef}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/45 rounded-full blur-xl pointer-events-none will-change-[transform,opacity]"
            />

            {/* Inner Floating Dish Container (Only the dish plates float) */}
            <div
              ref={dishContainerRef}
              className="relative w-full h-full will-change-transform"
            >
              {slides.map((slide, index) => (
                <div
                  key={slide.name}
                  ref={(el) => {
                    dishRefs.current[index] = el;
                  }}
                  className="absolute inset-0 will-change-[transform,opacity]"
                >
                  <div className="relative w-full h-full transition-transform duration-500 ease-out hover:scale-105">
                    <Image
                      src={slide.dish}
                      alt={slide.dishAlt}
                      fill
                      priority={index === 0}
                      className="object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)]"
                      sizes="(max-width: 640px) 224px, (max-width: 1024px) 352px, 420px"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Stable Prev/Next Arrows on Hover (Fixed position, never moves or bobs) */}
            <button
              onClick={prevSlide}
              className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/75 hover:bg-[#36D068] text-white border border-white/20 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl cursor-pointer text-sm sm:text-base font-bold z-40 backdrop-blur-xs"
              aria-label="Previous dish"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/75 hover:bg-[#36D068] text-white border border-white/20 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl cursor-pointer text-sm sm:text-base font-bold z-40 backdrop-blur-xs"
              aria-label="Next dish"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

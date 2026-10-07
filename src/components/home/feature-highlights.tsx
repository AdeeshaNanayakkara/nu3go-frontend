"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    id: 1,
    imageSrc: "/images/feature-fresh.png",
    alt: "Fresh Organic Ingredients",
    title: "FRESH",
    description:
      "Prepared fresh for your weekday mornings.",
    isCenter: false,
  },
  {
    id: 2,
    imageSrc: "/images/meal-2.png",
    alt: "Chef Crafted Meals",
    title: "HEALTHY",
    description:
      "Balanced breakfast options made for busy lifestyles.",
    isCenter: true,
  },
  {
    id: 3,
    imageSrc: "/images/meal-1.png",
    alt: "Signature Healthy Recipes",
    title: 'EVERY DAY',
    description:
      "Monday to Friday, without the daily hassle.",
    isCenter: false,
  },
];

export function FeatureHighlights() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ─── 1. Scroll-Triggered Staggered Entrance Animation ───
      const validCards = cardsRef.current.filter(Boolean);

      gsap.fromTo(
        validCards,
        {
          opacity: 0,
          y: 70,
          scale: 0.92,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      // ─── 2. Continuous Organic Floating Animations on Dish Images ───
      imageRefs.current.forEach((imgEl, idx) => {
        if (!imgEl) return;
        const duration = 3.2 + idx * 0.4;
        const yOffset = idx === 1 ? -10 : -8;
        const rotOffset = idx === 1 ? -1.8 : 1.5;

        gsap.to(imgEl, {
          y: yOffset,
          rotation: rotOffset,
          duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: idx * 0.35,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FAFAFA] pt-48 sm:pt-56 md:pt-40 lg:pt-60 xl:pt-64 pb-20 sm:pb-28 border-b border-slate-200/60 overflow-hidden select-none"
    >
      {/* ─── Ambient Glow Accents ─── */}
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-[#36D068]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#36D068]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-24 xl:gap-28 items-start">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className={`group flex flex-col items-center text-center will-change-[transform,opacity] ${
                feature.isCenter
                  ? "md:mt-10 lg:mt-14 xl:mt-16"
                  : "md:-mt-10 lg:-mt-16 xl:-mt-20"
              }`}
            >
              {/* Circular Image Container with GSAP Organic Float & Glow */}
              <div
                ref={(el) => {
                  imageRefs.current[index] = el;
                }}
                className="relative w-44 h-44 sm:w-52 sm:h-52 lg:w-60 lg:h-60 rounded-full overflow-hidden shadow-xl border-4 border-white bg-slate-100 group-hover:shadow-2xl group-hover:shadow-[#36D068]/20 transition-shadow duration-500 will-change-transform"
              >
                <Image
                  src={feature.imageSrc}
                  alt={feature.alt}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 176px, (max-width: 1024px) 208px, 240px"
                />
              </div>

              {/* Title in Brand Green (#36D068) */}
              <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase tracking-wider text-[#36D068] mt-6 mb-3 group-hover:text-[#2EB959] transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Description Text */}
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xs font-normal">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

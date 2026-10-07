"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INSTAGRAM_URL = "https://www.instagram.com/nu3.go?stkn=eGhwMjVvaGtsdDVv";

/** Official FontAwesome Brands Instagram Icon SVG */
function FaInstagram({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    </svg>
  );
}

const TOP_IMAGES = [
  { id: 1, src: "/images/insta-5.jpg", alt: "Nu3Go healthy friends dining" },
  { id: 2, src: "/images/insta-7.jpg", alt: "Nu3Go high protein bowl" },
  { id: 3, src: "/images/insta-12.jpg", alt: "Nu3Go nourish bowl", hideOnMobile: true },
  { id: 4, src: "/images/insta-4.jpg", alt: "Nu3Go gourmet healthy breakfast" },
];

const BOTTOM_IMAGES = [
  { id: 5, src: "/images/insta-3.jpg", alt: "Nu3Go fresh salmon salad" },
  { id: 6, src: "/images/insta-11.jpg", alt: "Nu3Go vegan grain bowl" },
  { id: 7, src: "/images/insta-6.jpg", alt: "Nu3Go healthy meal spread" },
  { id: 8, src: "/images/insta-8.jpg", alt: "Nu3Go green smoothie & detox" },
  { id: 9, src: "/images/insta-9.jpg", alt: "Nu3Go kitchen chef meal preparation" },
  { id: 10, src: "/images/insta-2.jpg", alt: "Nu3Go wholesome balanced meal", hideOnMobile: true },
];

export function InstagramGallery() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const centerCardRef = useRef<HTMLDivElement | null>(null);
  const instaIconRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const imageInnerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const validTiles = tileRefs.current.filter(Boolean);
      const validImageInners = imageInnerRefs.current.filter(Boolean);

      // ─── 1. Ripple Wave Entrance Reveal (ScrollTrigger / Initial Load) ───
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
        },
        defaults: { ease: "power3.out", force3D: true },
      });

      // Center Brand Card pops in first with subtle bounce
      if (centerCardRef.current) {
        entranceTl.fromTo(
          centerCardRef.current,
          { opacity: 0, scale: 0.88, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: "back.out(1.5)" }
        );
      }

      // Photos cascade in with ripple wave from center outward
      if (validTiles.length > 0) {
        entranceTl.fromTo(
          validTiles,
          { opacity: 0, scale: 0.92, y: 15 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            stagger: {
              amount: 0.45,
              from: "center",
            },
          },
          "-=0.6"
        );
      }

      // ─── 2. Smooth Cinematic Depth Zoom on Page Scroll ───
      // When scrolling through the section, images smoothly zoom for high-end camera depth
      if (validImageInners.length > 0) {
        gsap.fromTo(
          validImageInners,
          { scale: 1.14 },
          {
            scale: 1.0,
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

      // Center Card subtle float & depth elevation as you scroll past
      if (centerCardRef.current) {
        gsap.fromTo(
          centerCardRef.current,
          { y: 12, scale: 0.98 },
          {
            y: -12,
            scale: 1.02,
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

      // Center Instagram Icon subtle dynamic rotation on scroll
      if (instaIconRef.current) {
        gsap.fromTo(
          instaIconRef.current,
          { rotation: -16, scale: 0.95 },
          {
            rotation: 16,
            scale: 1.08,
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full select-none overflow-hidden bg-[#F7F6F2]"
    >
      {/* ─── 6-Column Instagram Mosaic Grid ─── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0">
        {/* Top Row: 3 Images (id: 3 hidden on mobile) */}
        {TOP_IMAGES.slice(0, 3).map((item, idx) => (
          <Link
            key={item.id}
            ref={(el) => {
              tileRefs.current[idx] = el;
            }}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative aspect-square w-full overflow-hidden bg-[#F7F6F2] will-change-transform ${
              item.hideOnMobile ? "hidden lg:block" : "block"
            }`}
          >
            {/* Inner Image Container for Smooth Depth Parallax Zoom */}
            <div
              ref={(el) => {
                imageInnerRefs.current[idx] = el;
              }}
              className="relative w-full h-full will-change-transform"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                loading="eager"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16.66vw"
              />
            </div>
            {/* Hover Gradient Overlay with Instagram Badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 p-4 z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                <FaInstagram className="w-5 h-5 text-white" />
              </div>
              <span className="font-oswald text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 drop-shadow">
                @nu3go
              </span>
            </div>
          </Link>
        ))}

        {/* Follow @nu3go. Center Card in Brand Green (Spans 2 Columns on Mobile & Desktop) */}
        <div
          ref={centerCardRef}
          className="col-span-2 bg-[#36D068] p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center text-center text-white relative z-10 will-change-transform"
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
            <div ref={instaIconRef} className="shrink-0 will-change-transform">
              <FaInstagram className="w-8 h-8 sm:w-11 sm:h-11 text-white drop-shadow-sm" />
            </div>
            <h3 className="font-oswald text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight leading-none">
              FOLLOW @nu3go.
            </h3>
          </div>

          <p className="text-white/95 text-xs sm:text-sm leading-relaxed max-w-sm mb-5 sm:mb-6 font-normal">
            Join our healthy food community on Instagram for daily clean eats, fitness inspiration &amp; exclusive meal drops.
          </p>

          <Link
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-[#36D068] px-6 py-2.5 sm:py-3 font-oswald text-xs sm:text-sm font-bold tracking-[0.15em] uppercase transition-colors duration-300 shadow-md hover:shadow-lg active:scale-95"
          >
            <FaInstagram className="w-4 h-4" />
            <span>VISIT INSTAGRAM</span>
          </Link>
        </div>

        {/* Top Row: 1 Image on Right (id: 4) */}
        {TOP_IMAGES.slice(3, 4).map((item, idx) => (
          <Link
            key={item.id}
            ref={(el) => {
              tileRefs.current[3 + idx] = el;
            }}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square w-full overflow-hidden bg-[#F7F6F2] block will-change-transform"
          >
            <div
              ref={(el) => {
                imageInnerRefs.current[3 + idx] = el;
              }}
              className="relative w-full h-full will-change-transform"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                loading="eager"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16.66vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 p-4 z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                <FaInstagram className="w-5 h-5 text-white" />
              </div>
              <span className="font-oswald text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 drop-shadow">
                @nu3go
              </span>
            </div>
          </Link>
        ))}

        {/* Bottom Row: 6 Images (id: 10 hidden on mobile) */}
        {BOTTOM_IMAGES.map((item, idx) => (
          <Link
            key={item.id}
            ref={(el) => {
              tileRefs.current[4 + idx] = el;
            }}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative aspect-square w-full overflow-hidden bg-[#F7F6F2] will-change-transform ${
              item.hideOnMobile ? "hidden lg:block" : "block"
            }`}
          >
            <div
              ref={(el) => {
                imageInnerRefs.current[4 + idx] = el;
              }}
              className="relative w-full h-full will-change-transform"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                loading="eager"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16.66vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 p-4 z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                <FaInstagram className="w-5 h-5 text-white" />
              </div>
              <span className="font-oswald text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 drop-shadow">
                @nu3go
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

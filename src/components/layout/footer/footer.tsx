"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/constants/routes";
import { Mail, Phone } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INSTAGRAM_URL = "https://www.instagram.com/nu3.go?stkn=eGhwMjVvaGtsdDVv";

export function Footer() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const bottomBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      // ─── Main Footer Entrance Timeline ───
      const footerTl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 95%",
          toggleActions: "play none none none",
          once: true,
        },
        defaults: { ease: "power3.out", force3D: true },
      });

      if (gridRef.current) {
        footerTl.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            clearProps: "opacity,transform",
          }
        );
      }

      if (bottomBarRef.current) {
        footerTl.fromTo(
          bottomBarRef.current,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            clearProps: "opacity,transform",
          },
          "-=0.3"
        );
      }
    }, footerRef);

    // Refresh ScrollTrigger after DOM has settled on route change
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [pathname]);

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-white text-neutral-800 pt-16 sm:pt-20 pb-10 overflow-visible border-t border-neutral-200/70 select-none"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* ══════════════════════════════════════════════════════════
            1. MAIN FOOTER 5-COLUMN NAVIGATION & INFO GRID
           ══════════════════════════════════════════════════════════ */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-8 xl:gap-10 pb-12 sm:pb-16"
        >
          {/* ─── Column 1: Brand Logo, Bio & Social Media Icons (Span 4) ─── */}
          <div className="lg:col-span-4 flex flex-col items-start will-change-[transform,opacity]">
            {/* Logo */}
            <div className="mb-4">
              <Logo
                variant="default"
                imageClassName="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Short Bio */}
            <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-sm mb-6 font-normal">
              Sri Lanka&apos;s premier subscription-based healthy meal delivery service. Fresh chef-crafted, calorie-counted wholesome meals delivered daily to your doorstep.
            </p>

            {/* Social Media Icons (Black & Green Circles) */}
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-[#36D068] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-current">
                  <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256c0 120 82.7 220.8 194.2 248.5V334.2h-52.8V256h52.8v-33.7c0-87.1 39.4-127.5 125-127.5 16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1-42 0-58.2 15.9-58.2 57.2V256h84.8l-13.2 78.2h-71.6V508.9C433.8 485.4 512 379.9 512 256z" />
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-[#36D068] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-3.5 h-3.5 fill-current">
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-[#36D068] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 fill-current">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-[#36D068] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-3.5 h-3.5 fill-current">
                  <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-[#36D068] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 fill-current">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ─── Column 2: Pages (Span 2) ─── */}
          <div className="lg:col-span-2 flex flex-col will-change-[transform,opacity]">
            <h4 className="font-bold text-neutral-900 text-sm sm:text-base mb-4 sm:mb-5">
              Pages
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Our Menu", href: "/services" },
                { label: "Plans", href: "/plans" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-neutral-600 hover:text-[#36D068] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Column 3: Support (Span 2) ─── */}
          <div className="lg:col-span-2 flex flex-col will-change-[transform,opacity]">
            <h4 className="font-bold text-neutral-900 text-sm sm:text-base mb-4 sm:mb-5">
              Support
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                { label: "Help Center", href: "/faq" },
                { label: "Order Tracking", href: "/orders" },
                { label: "Delivery Areas", href: "/services" },
                { label: "Services", href: "/services" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-neutral-600 hover:text-[#36D068] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Column 4: Terms & Conditions (Span 2) ─── */}
          <div className="lg:col-span-2 flex flex-col will-change-[transform,opacity]">
            <h4 className="font-bold text-neutral-900 text-sm sm:text-base mb-4 sm:mb-5">
              Terms &amp; Conditions
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Conditions", href: "/terms" },
                { label: "Feedback", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-neutral-600 hover:text-[#36D068] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Column 5: Contact Us (Span 2) ─── */}
          <div className="lg:col-span-2 flex flex-col will-change-[transform,opacity]">
            <h4 className="font-bold text-neutral-900 text-sm sm:text-base mb-4 sm:mb-5">
              Contact Us
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-neutral-600">
              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#36D068] shrink-0" />
                <a href="tel:+94112345678" className="hover:text-[#36D068] transition-colors">
                  (011) 234 5678
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#36D068] shrink-0" />
                <a href="mailto:support@nu3go.com" className="hover:text-[#36D068] transition-colors">
                  support@nu3go.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            2. BOTTOM COPYRIGHT & POWERED BY BAR
           ══════════════════════════════════════════════════════════ */}
        <div
          ref={bottomBarRef}
          className="pt-8 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 will-change-[transform,opacity]"
        >
          {/* Copyright */}
          <div>
            &copy; {new Date().getFullYear()} Copyright by nu3go (Pvt) Ltd. All rights reserved.
          </div>

          {/* Powered by taysa */}
          <div className="text-xs text-neutral-600 font-medium">
            Powered by <span className="text-neutral-900 font-bold uppercase tracking-wider">taysa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

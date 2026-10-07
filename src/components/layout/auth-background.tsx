"use client";

import Image from "next/image";

/**
 * Creative culinary background for customer authentication flows (Login and Register/Sign Up).
 * Renders high-end dark green culinary atmosphere with fine dining & fresh nutrition elements.
 */
export function AuthBackground() {
  const bgImage = "/images/auth_dark_green_bg.jpg";

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {/* ─── High-Res Dark Green Culinary Background Image ─── */}
      <Image
        src={bgImage}
        alt="Nu3Go culinary dark green background"
        fill
        priority
        quality={95}
        className="object-cover object-center scale-105 transition-transform duration-1000 ease-out"
      />

      {/* ─── Cinematic Dark Green Vignette & Atmosphere ─── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06140B]/55 via-[#0A1A0F]/45 to-[#040C07]/75 backdrop-blur-[1px]" />

      {/* ─── Subtle Radial Darkening at Corners ─── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(4,12,7,0.75)_100%)]" />

      {/* ─── Ambient Emerald Glow Accents ─── */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#36D068]/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#15803D]/20 rounded-full blur-[120px]" />
    </div>
  );
}

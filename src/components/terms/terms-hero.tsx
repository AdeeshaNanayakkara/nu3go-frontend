import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Clock, Calendar, ArrowRight, HelpCircle } from "lucide-react";

export function TermsHero() {
  return (
    <section className="relative w-full overflow-hidden select-none bg-neutral-950 pt-24 sm:pt-28 lg:pt-32 pb-24 sm:pb-32 md:pb-36 lg:pb-44 flex flex-col justify-center items-center text-center">
      {/* ─── Immersive Background Image with Cinematic Overlay ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/images/plans-hero-bg.jpg"
          alt="Nu3Go Chef Crafted Healthy Meal Prep"
          fill
          priority
          quality={95}
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark Cinematic Vignette Overlay with Deep Emerald Tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-[#0B3B17]/75 to-black/90" />
        {/* Subtle radial dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#36D068_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
      </div>

      {/* ─── Ambient Glow Accent ─── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-96 bg-[#36D068]/15 rounded-full blur-3xl pointer-events-none z-10" />

      {/* ─── Hero Content ─── */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#36D068]/20 border border-[#36D068]/40 px-4 py-1.5 rounded-full text-[#36D068] font-oswald text-xs font-bold uppercase tracking-widest mb-4 shadow-sm backdrop-blur-xs">
          <ShieldCheck className="w-4 h-4 text-[#36D068]" />
          <span>TRANSPARENT SERVICE POLICIES</span>
        </div>

        {/* Title */}
        <h1 className="font-oswald text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-xl mb-3">
          TERMS &amp; CONDITIONS
        </h1>

        {/* Subtitle */}
        <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed drop-shadow-sm">
          Welcome to nu3go! By subscribing to our weekday meal delivery service, you agree to the following terms, delivery schedules, and wallet credit policies.
        </p>

        {/* Effective Date & Delivery Window Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-white/80 font-medium">
          <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3.5 py-1 rounded-full border border-white/15">
            <Calendar className="w-3.5 h-3.5 text-[#36D068]" />
            Effective Date: November 2026
          </span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3.5 py-1 rounded-full border border-white/15">
            <Clock className="w-3.5 h-3.5 text-[#36D068]" />
            Delivery Window: 6:30 AM – 9:00 AM
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 bg-[#36D068] hover:bg-[#2eb95c] text-[#0B3B17] font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-transform duration-200 hover:scale-105 shadow-lg shadow-[#36D068]/20"
          >
            <span>EXPLORE MEAL PLANS</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/faq"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/20 text-white font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#36D068]" />
            <span>BROWSE FAQS</span>
          </Link>
        </div>
      </div>

      {/* ─── Outward Downward Curved SVG Bottom Divider (Matching Plans Hero Style) ─── */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none -mb-px">
        <svg
          viewBox="0 0 1440 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-16 sm:h-24 md:h-28 lg:h-36 block text-[#FAF9F5] fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0 0 C480 140 960 140 1440 0 V160 H0 Z" />
        </svg>
      </div>
    </section>
  );
}

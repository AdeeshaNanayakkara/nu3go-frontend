"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Award, Leaf, ShieldCheck, Sparkles, Salad } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AboutStory() {
  const containerRef = useRef<HTMLElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // ─── Scroll-triggered Stagger Fade In ───
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: leftColRef.current,
              start: "top 80%",
            },
          }
        );
      }

      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { opacity: 0, scale: 0.94, y: 40 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rightColRef.current,
              start: "top 75%",
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
      className="relative bg-[#F7F6F2] pt-8 sm:pt-12 lg:pt-20 pb-20 sm:pb-28 lg:pb-32 overflow-hidden text-neutral-900 -mt-2 sm:-mt-4 lg:-mt-8 relative z-30"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* ─── 2-Column Main Layout (Astra Pizzeria Style) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          
          {/* ─── LEFT COLUMN: Header, Intro, Founder Box, Narrative Blocks ─── */}
          <div ref={leftColRef} className="lg:col-span-7 flex flex-col">
            {/* Tagline */}
            <span className="font-oswald text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#36D068] mb-2 sm:mb-3">
              OUR STORY
            </span>

            {/* Headline */}
            <h2 className="font-oswald text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black uppercase text-neutral-900 tracking-tight leading-[1.1] mb-6">
              PIONEERING CULINARY NUTRITION
            </h2>

            {/* Intro Paragraph */}
            <p className="text-neutral-600 text-base sm:text-lg leading-relaxed mb-10 font-normal">
              Nu3Go was founded with a singular conviction: healthy eating should never be a dull compromise. By uniting fine-dining culinary chefs with clinical dietitians, we craft restaurant-quality meals calibrated to your body&apos;s exact metabolic needs.
            </p>

            {/* ─── Sub-grid: Founder Card & Narrative Sub-blocks ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-start pt-2 border-t border-neutral-300/70">
              {/* Founder Profile Card */}
              <div className="sm:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left bg-white p-6 rounded-2xl shadow-sm border border-neutral-200/80">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 ring-4 ring-[#36D068]/20 shadow-md">
                  <Image
                    src="/images/about-founder.jpg"
                    alt="Mr. Abishake - Founder of Nu3Go"
                    fill
                    className="object-cover object-center"
                    sizes="128px"
                  />
                </div>
                <h4 className="font-oswald text-lg sm:text-xl font-bold uppercase text-neutral-900 tracking-tight">
                  Mr. Abishake
                </h4>
                <p className="text-xs font-semibold tracking-wider text-[#36D068] mb-3 uppercase">
                  Founder &amp; CEO
                </p>
                <p className="text-neutral-500 text-xs leading-relaxed italic">
                  &ldquo;True vitality begins on your plate. Our commitment is delivering chef-crafted meals that fuel human potential and taste extraordinary.&rdquo;
                </p>
              </div>

              {/* Story Narrative Subsections */}
              <div className="sm:col-span-7 flex flex-col space-y-6">
                <div>
                  <h3 className="font-oswald text-xl font-bold uppercase text-neutral-900 tracking-tight mb-2 flex items-center gap-2">
                    <Salad className="w-4 h-4 text-[#36D068]" />
                    Macro-Precision &amp; Science
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Every dish is calibrated to exact gram-level macronutrient ratios. Our registered sports nutritionists calculate lean proteins, complex low-glycemic carbohydrates, and healthy fats tailored to your performance goals.
                  </p>
                </div>

                <div>
                  <h3 className="font-oswald text-xl font-bold uppercase text-neutral-900 tracking-tight mb-2 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#36D068]" />
                    Artisanal Daily Sourcing
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    We partner with certified local organic growers, sourcing 100% pesticide-free produce, grass-fed proteins, and cold-pressed botanical oils prepared fresh each morning with zero chemical additives.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Heritage Culinary Visual Showcase ─── */}
          <div ref={rightColRef} className="lg:col-span-5 relative">
            <div className="relative w-full h-[450px] sm:h-[540px] lg:h-[620px] rounded-3xl overflow-hidden shadow-2xl shadow-neutral-900/10 border border-neutral-200/80 group">
              <Image
                src="/images/how-to-work.jpg"
                alt="Nu3Go Artisanal Meal Preparation"
                fill
                quality={90}
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Floating Badge in Bottom Corner */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-white/40 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#36D068]/15 flex items-center justify-center text-[#36D068] shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-oswald text-base font-bold uppercase text-neutral-900 leading-tight">
                    Gold-Standard Culinary Nutrition
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium">
                    100% Chef-Prepared Daily &amp; Clinical Macro Calibration
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Corner Element */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#36D068]/10 rounded-full blur-xl pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}

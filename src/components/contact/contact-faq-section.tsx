"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  HelpCircle,
  ChevronDown,
  Search,
  Sparkles,
  MessageSquare,
  ArrowDown,
  CheckCircle2,
  PhoneCall
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { faqService, type FAQItem } from "@/services/api/faq.service";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ContactFaqSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const accordionRef = useRef<HTMLDivElement | null>(null);

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({
    "faq-1": true, // Default first open
  });

  useEffect(() => {
    async function loadFaqs() {
      try {
        setLoading(true);
        const data = await faqService.getPublicFaqs();
        setFaqs(data);
        if (data.length > 0 && data[0]?.id) {
          setOpenFaqIds({ [data[0].id]: true });
        }
      } catch (err) {
        console.warn("Could not load FAQs from public API:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFaqs();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    faqs.forEach((f) => {
      allOpen[f.id] = true;
    });
    setOpenFaqIds(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenFaqIds({});
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  const scrollToContactForm = () => {
    const formEl = document.getElementById("contact-form-card");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = "/contact#contact-form-card";
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#F7F6F2] pt-8 sm:pt-12 lg:pt-14 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 overflow-visible select-none"
    >
      <div className="max-w-[1240px] mx-auto">

        {/* ─── Main FAQ Container Box (Matching Nu3Go Aesthetic) ─── */}
        <div
          ref={containerRef}
          className="relative z-30 bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl shadow-neutral-900/10 border border-neutral-200/90 overflow-hidden"
        >
          {/* ─── Top Header Bar: Dark Forest Green (#0B3B17) ─── */}
          <div className="bg-[#0B3B17] px-6 sm:px-10 lg:px-12 py-8 text-white relative overflow-hidden">
            {/* Subtle glow accent */}
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#36D068]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
              <div>
                {/* Eyebrow Tag */}
                <div className="inline-flex items-center gap-2 bg-[#36D068]/20 border border-[#36D068]/40 px-3.5 py-1 rounded-full text-[#36D068] font-oswald text-xs font-bold uppercase tracking-widest mb-3">
                  <HelpCircle className="w-3.5 h-3.5 text-[#36D068]" />
                  <span>COMMON QUESTIONS &amp; ANSWERS</span>
                </div>

                <h2 className="font-oswald text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-none">
                  FREQUENTLY ASKED QUESTIONS
                </h2>

                <p className="text-emerald-200/90 text-xs sm:text-sm max-w-xl mt-2 font-medium">
                  Got questions about our macro plans, delivery schedules, or ingredients? Find quick answers right here.
                </p>
              </div>

              {/* Quick Actions (Expand/Collapse & Search) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-emerald-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full sm:w-56 bg-black/30 text-white placeholder-emerald-200/60 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-white/15 focus:outline-none focus:border-[#36D068] focus:ring-1 focus:ring-[#36D068] transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/15">
                  <button
                    onClick={handleExpandAll}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-oswald font-bold tracking-wider uppercase text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={handleCollapseAll}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-oswald font-bold tracking-wider uppercase text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Collapse
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Accordion Content Area ─── */}
          <div className="p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-[#FAF9F5] to-white">
            {loading ? (
              /* Loading Skeleton */
              <div className="space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredFaqs.length === 0 ? (
              /* No Search Match State */
              <div className="text-center py-12 px-4">
                <p className="text-slate-500 text-sm font-medium">
                  No matching questions found for &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs font-bold text-[#15803D] hover:underline font-oswald uppercase"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              /* FAQ Accordion List */
              <div ref={accordionRef} className="space-y-3.5">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = !!openFaqIds[faq.id];
                  const numStr = String(index + 1).padStart(2, "0");

                  return (
                    <div
                      key={faq.id}
                      className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
                          ? "bg-white border-[#36D068]/40 shadow-lg shadow-emerald-950/5 ring-1 ring-[#36D068]/20"
                          : "bg-white/90 hover:bg-white border-slate-200/90 shadow-2xs hover:shadow-md"
                        }`}
                    >
                      {/* Accordion Trigger Header */}
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-5 sm:px-6 py-4.5 sm:py-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                          {/* Number Badge */}
                          <span
                            className={`font-oswald text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg shrink-0 transition-colors ${isOpen
                                ? "bg-[#36D068] text-[#0B3B17]"
                                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                              }`}
                          >
                            {numStr}
                          </span>

                          {/* Question Text */}
                          <span
                            className={`font-oswald text-base sm:text-lg font-bold tracking-tight uppercase leading-snug transition-colors ${isOpen ? "text-[#0B3B17]" : "text-slate-900 group-hover:text-[#15803D]"
                              }`}
                          >
                            {faq.question}
                          </span>
                        </div>

                        {/* Expand/Collapse Chevron Icon */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 border ${isOpen
                              ? "bg-[#0B3B17] text-[#36D068] border-[#0B3B17] rotate-180"
                              : "bg-slate-50 text-slate-400 border-slate-200 group-hover:text-slate-700 group-hover:border-slate-300"
                            }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </button>

                      {/* Accordion Body Content */}
                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-slate-100 bg-[#FAF9F5]/60">
                          <div className="flex items-start gap-3 mt-2">
                            <div className="w-1.5 h-auto self-stretch rounded-full bg-[#36D068] shrink-0" />
                            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-normal">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Bottom Contact Assistance Banner ─── */}
          <div className="bg-[#FAF9F5] px-6 sm:px-10 lg:px-12 py-4.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 font-medium text-center sm:text-left">
              <MessageSquare className="w-4 h-4 text-[#36D068] shrink-0" />
              <span>Have a specific dietary question or custom enterprise request?</span>
            </div>

            <button
              onClick={scrollToContactForm}
              className="inline-flex items-center gap-2 bg-[#0B3B17] hover:bg-[#124D20] text-white px-5 py-2.5 rounded-full font-oswald text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm hover:scale-105 cursor-pointer"
            >
              <span>SEND A DIRECT INQUIRY</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#36D068]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

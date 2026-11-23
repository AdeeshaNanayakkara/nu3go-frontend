"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Wallet,
  UtensilsCrossed,
  MapPin,
  Clock,
  Building2,
  ShieldAlert,
  UserCheck,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SectionItem {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
}

const SECTIONS: SectionItem[] = [
  { id: "delivery-schedule", number: "1", title: "Delivery Schedule", icon: Truck },
  { id: "cancellations-wallet", number: "2", title: "Cancellations & Wallet Credits", icon: Wallet },
  { id: "meal-changes", number: "3", title: "Meal Changes", icon: UtensilsCrossed },
  { id: "address-changes", number: "4", title: "Delivery Address Changes", icon: MapPin },
  { id: "customer-availability", number: "5", title: "Delivery & Customer Availability", icon: Clock },
  { id: "alternative-dropoff", number: "6", title: "Alternative Drop-Off Arrangements", icon: Building2 },
  { id: "failed-deliveries", number: "7", title: "Failed Deliveries by nu3go", icon: ShieldAlert },
  { id: "customer-responsibilities", number: "8", title: "Customer Responsibilities", icon: UserCheck },
  { id: "updates-to-terms", number: "9", title: "Updates to These Terms", icon: RefreshCw },
  { id: "contact-agreement", number: "10", title: "Contact & Agreement", icon: PhoneCall },
];

export function TermsContent() {
  const [activeSection, setActiveSection] = useState<string>("delivery-schedule");

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <section className="relative w-full bg-[#FAF9F5] py-12 sm:py-16 lg:py-20 text-neutral-900">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ─── Left Sticky Sidebar: Table of Contents (Desktop) ─── */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-6">
              
              {/* Table of Contents Card */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#36D068]" />
                  <h3 className="font-oswald text-sm font-bold uppercase tracking-wider text-neutral-900">
                    TABLE OF CONTENTS
                  </h3>
                </div>

                <nav className="space-y-1">
                  {SECTIONS.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className={`w-full text-left flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#0B3B17] text-white font-semibold shadow-xs"
                            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#36D068]" : "text-neutral-400"}`} />
                          <span className="truncate">
                            {sec.number}. {sec.title}
                          </span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? "text-[#36D068] translate-x-0.5" : "text-neutral-300"}`} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Support Callout Mini Card */}
              <div className="bg-neutral-900 rounded-3xl p-6 text-white border border-neutral-800 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/20 text-[#36D068] flex items-center justify-center mb-4">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h4 className="font-oswald text-base font-bold uppercase text-white tracking-wide">
                  Have Questions?
                </h4>
                <p className="text-white/70 text-xs mt-1 leading-relaxed">
                  Our customer support team is available to help with delivery locations, subscription pauses, and meal swaps.
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-[#36D068] hover:text-emerald-300 text-xs font-oswald font-bold uppercase tracking-wider transition-colors"
                  >
                    <span>Contact Support</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/faq"
                    className="text-xs text-white/50 hover:text-white transition-colors"
                  >
                    View FAQs
                  </Link>
                </div>
              </div>

            </div>
          </aside>

          {/* ─── Right Main Column: Terms & Conditions Sections ─── */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Welcome Preamble Card */}
            <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 rounded-3xl p-6 sm:p-8 border border-[#36D068]/30 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#36D068]" />
                <span className="font-oswald text-xs font-bold uppercase tracking-wider text-emerald-800">
                  AGREEMENT TO TERMS
                </span>
              </div>
              <h2 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-neutral-900 tracking-tight mb-2">
                Welcome to nu3go!
              </h2>
              <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">
                By subscribing to our weekday meal delivery service, you agree to the following Terms &amp; Conditions. Please review them carefully to ensure smooth deliveries and hassle-free subscription management.
              </p>
            </div>

            {/* ─── 1. Delivery Schedule ─── */}
            <section
              id="delivery-schedule"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/15 text-emerald-800 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-[#0B3B17]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                    SECTION 01
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900 tracking-tight">
                    1. Delivery Schedule
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/70">
                    <span className="text-xs font-oswald font-bold uppercase text-neutral-500 block mb-1">
                      Operating Days
                    </span>
                    <p className="font-semibold text-neutral-900 text-sm">
                      Monday to Friday
                    </p>
                    <span className="text-xs text-neutral-500 mt-1 block">
                      Excludes public and mercantile holidays
                    </span>
                  </div>

                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/70">
                    <span className="text-xs font-oswald font-bold uppercase text-neutral-500 block mb-1">
                      Delivery Window
                    </span>
                    <p className="font-semibold text-neutral-900 text-sm">
                      6:30 AM – 9:00 AM
                    </p>
                    <span className="text-xs text-emerald-700 font-medium mt-1 block">
                      Target completion by 8:30 AM
                    </span>
                  </div>
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Deliveries are made Monday to Friday</strong>, excluding public and mercantile holidays in Sri Lanka.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      Our official delivery window is between <strong>6:30 AM and 9:00 AM</strong>, with an operational target of completing deliveries by <strong>8:30 AM</strong> so your workday breakfast is ready on time.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Planned Route Origin:</strong> Deliveries follow strictly planned logistics routes starting each morning from our central prep facility in <strong>Wattala</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                    <span className="text-neutral-600">
                      Exact delivery times cannot be guaranteed as route traffic, adverse weather, roadblocks, and other unforeseen circumstances may cause minor timing adjustments.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* ─── 2. Cancellations & Wallet Credits ─── */}
            <section
              id="cancellations-wallet"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/15 text-emerald-800 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-[#0B3B17]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                    SECTION 02
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900 tracking-tight">
                    2. Cancellations &amp; Wallet Credits
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
                <p>
                  All eligible cancellations are compensated strictly through <strong>nu3go wallet credits</strong>. Cash or bank refunds are not provided under this policy.
                </p>

                {/* Visual 3-Tier Cutoff Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
                  {/* Tier 1: 100% */}
                  <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1 text-[11px] font-oswald font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider mb-2">
                        100% Credit
                      </div>
                      <h4 className="font-oswald font-bold text-neutral-900 text-base">
                        Before 6:00 PM
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1">
                        Previous day cancellation
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-emerald-800 mt-3 pt-2 border-t border-emerald-200/50">
                      100% of meal value credited to wallet
                    </p>
                  </div>

                  {/* Tier 2: 50% */}
                  <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1 text-[11px] font-oswald font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white uppercase tracking-wider mb-2">
                        50% Credit
                      </div>
                      <h4 className="font-oswald font-bold text-neutral-900 text-base">
                        6:00 PM – 11:59 PM
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1">
                        Previous day late cancellation
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-amber-800 mt-3 pt-2 border-t border-amber-200/50">
                      50% of meal value credited to wallet
                    </p>
                  </div>

                  {/* Tier 3: 0% */}
                  <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1 text-[11px] font-oswald font-bold px-2 py-0.5 rounded-full bg-neutral-400 text-white uppercase tracking-wider mb-2">
                        No Credit
                      </div>
                      <h4 className="font-oswald font-bold text-neutral-900 text-base">
                        After Midnight
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1">
                        On delivery day morning
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-neutral-600 mt-3 pt-2 border-t border-neutral-200">
                      No wallet credit will be provided
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/70 text-xs sm:text-sm text-neutral-600">
                  <p>
                    💡 <strong>Wallet Credit Usage:</strong> Wallet credits are automatically stored in your nu3go profile and can be applied towards future eligible nu3go subscription packages or renewals.
                  </p>
                </div>
              </div>
            </section>

            {/* ─── 3. Meal Changes ─── */}
            <section
              id="meal-changes"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/15 text-emerald-800 flex items-center justify-center shrink-0">
                  <UtensilsCrossed className="w-5 h-5 text-[#0B3B17]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                    SECTION 03
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900 tracking-tight">
                    3. Meal Changes
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
                <div className="bg-[#FAF9F5] rounded-2xl p-5 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-oswald font-bold text-neutral-900 text-base sm:text-lg uppercase">
                      Replacement Meal Cutoff
                    </h4>
                    <p className="text-neutral-600 text-xs sm:text-sm mt-1">
                      Replacement Meal must be requested <strong>before 6:00 PM on the previous day</strong>.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B3B17] text-white font-oswald text-xs font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-[#36D068]" />
                      Cutoff: 6:00 PM
                    </span>
                  </div>
                </div>

                <p className="text-neutral-600 text-xs sm:text-sm">
                  Because our culinary team purchases fresh market produce and prepares meals custom each morning, meal swap and replacement requests cannot be processed after the 6:00 PM previous-day cutoff.
                </p>
              </div>
            </section>

            {/* ─── 4. Delivery Address Changes ─── */}
            <section
              id="address-changes"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/15 text-emerald-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#0B3B17]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                    SECTION 04
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900 tracking-tight">
                    4. Delivery Address Changes
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Coverage Requirement:</strong> Customers may change their delivery address if the new location falls within nu3go&apos;s active service coverage area.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Submission Cutoff:</strong> Address change requests must be submitted <strong>before 6:00 PM on the previous day</strong> to be reflected in the next morning&apos;s rider route plan.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Accurate Instructions:</strong> Customers must provide accurate delivery details, contact numbers, and any necessary access instructions (e.g., security gate, floor number, or building name).
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* ─── 5. Delivery & Customer Availability ─── */}
            <section
              id="customer-availability"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/15 text-emerald-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#0B3B17]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                    SECTION 05
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900 tracking-tight">
                    5. Delivery &amp; Customer Availability
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-oswald font-bold text-neutral-900 text-sm sm:text-base uppercase">
                      5-Minute Rider Waiting Limit
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-700 mt-1">
                      Our delivery rider will wait a <strong>maximum of 5 minutes</strong> at the delivery location. Because our riders maintain time-sensitive morning delivery schedules for multiple subscribers, extended waiting is not feasible.
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Arrival Contact:</strong> Riders may contact customers by phone upon arrival at the location.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Reachable Window:</strong> Customers must remain reachable by phone during the designated morning delivery window (6:30 AM – 9:00 AM).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />
                    <span>
                      <strong>Unsuccessful Deliveries:</strong> If a customer is unavailable, unreachable, or fails to collect the meal within the 5-minute waiting period, the delivery will be marked as unsuccessful.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />
                    <span className="text-neutral-600 text-xs sm:text-sm">
                      No refund, wallet credit, or replacement meal will be provided for unsuccessful deliveries caused by customer unavailability or incorrect delivery information.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* ─── 6. Alternative Drop-Off Arrangements ─── */}
            <section
              id="alternative-dropoff"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/15 text-emerald-800 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[#0B3B17]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                    SECTION 06
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900 tracking-tight">
                    6. Alternative Drop-Off Arrangements
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Approved Drop-Off Locations:</strong> Customers may request delivery to an approved reception desk, security desk, guard room, or another agreed location at their apartment complex or corporate office.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Building Permissions:</strong> Customers are strictly responsible for obtaining the necessary permission from building management, security personnel, or workplace administration.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Advance Notice:</strong> Clear drop-off instructions must be provided to nu3go in advance.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-1" />
                    <span>
                      <strong>Transfer of Responsibility:</strong> Once the meal is handed over or left at the customer-authorised location, responsibility for collecting and securing it rests with the customer, subject to applicable law.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* ─── 7. Failed Deliveries by nu3go ─── */}
            <section
              id="failed-deliveries"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/15 text-emerald-800 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-[#0B3B17]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                    SECTION 07
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900 tracking-tight">
                    7. Failed Deliveries by nu3go
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
                {/* 100% Automatic Credit Highlight Banner */}
                <div className="bg-emerald-50 rounded-2xl p-5 border border-[#36D068]/40">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-[#36D068] text-neutral-950 flex items-center justify-center font-black text-xs">
                      ✓
                    </div>
                    <h4 className="font-oswald font-black text-emerald-950 text-base sm:text-lg uppercase">
                      100% Automatic Wallet Credit Guarantee
                    </h4>
                  </div>
                  <p className="text-emerald-900 text-sm leading-relaxed">
                    If nu3go fails to deliver a scheduled meal due to reasons attributable to nu3go, <strong>100% of the meal value will automatically be credited</strong> to the customer&apos;s nu3go wallet.
                  </p>
                  <p className="text-emerald-800 text-xs font-semibold mt-2">
                    ✨ Customers do NOT need to make a separate request or claim for this credit.
                  </p>
                </div>

                <p className="text-neutral-500 text-xs sm:text-sm">
                  <em>Note:</em> This guarantee does not apply to unsuccessful deliveries caused by customer unavailability, incorrect delivery details, or lack of necessary access permissions.
                </p>
              </div>
            </section>

            {/* ─── 8. Customer Responsibilities ─── */}
            <section
              id="customer-responsibilities"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/15 text-emerald-800 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-[#0B3B17]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                    SECTION 08
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900 tracking-tight">
                    8. Customer Responsibilities
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
                <p className="mb-2 font-medium text-neutral-900">
                  Customers subscribing to nu3go are responsible for:
                </p>

                {[
                  "Providing accurate contact details and delivery addresses.",
                  "Ensuring the delivery location is accessible to riders.",
                  "Obtaining necessary permissions for alternative drop-offs (reception, security, etc.).",
                  "Keeping their phones reachable during the morning delivery window (6:30 AM – 9:00 AM).",
                  "Submitting cancellations, meal swaps, and address changes before the applicable cutoff time (6:00 PM previous day).",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-0.5" />
                    <span className="text-neutral-800 text-xs sm:text-sm font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ─── 9. Updates to These Terms ─── */}
            <section
              id="updates-to-terms"
              className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/15 text-emerald-800 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-[#0B3B17]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                    SECTION 09
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900 tracking-tight">
                    9. Updates to These Terms
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-neutral-700 text-sm sm:text-[15px] leading-relaxed">
                <p>
                  nu3go reserves the right to update these Terms &amp; Conditions when necessary due to operational changes, routing enhancements, or service improvements.
                </p>
                <p>
                  Updated terms will be published on our official website. Continued subscription to our meal service following any posted changes constitutes your agreement to the revised Terms &amp; Conditions.
                </p>
              </div>
            </section>

            {/* ─── 10. Contact & Agreement ─── */}
            <section
              id="contact-agreement"
              className="bg-neutral-950 rounded-3xl p-6 sm:p-8 text-white border border-neutral-800 shadow-xl scroll-mt-28"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#36D068]/20 text-[#36D068] flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                    SECTION 10
                  </span>
                  <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                    10. Contact &amp; Agreement
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-white/80 text-sm sm:text-[15px] leading-relaxed">
                <p>
                  For questions or assistance regarding these terms, our delivery policies, or your active subscription, please contact nu3go through the official customer support channels listed on our website.
                </p>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 my-4">
                  <p className="text-white text-xs sm:text-sm font-medium">
                    By subscribing to nu3go, you acknowledge that you have read, understood, and agreed to these Terms &amp; Conditions.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-oswald text-xs font-bold text-[#36D068] tracking-widest uppercase block">
                      OUR PROMISE
                    </span>
                    <h4 className="font-oswald text-xl font-bold uppercase text-white tracking-wide">
                      nu3go – Fresh. Healthy. Every Day.
                    </h4>
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-[#36D068] hover:bg-emerald-400 text-neutral-950 font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-[#36D068]/20 shrink-0"
                  >
                    <span>Contact Support</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </section>
  );
}

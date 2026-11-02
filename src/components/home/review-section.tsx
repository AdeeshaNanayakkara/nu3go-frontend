"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Star,
  Quote,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Truck,
  ChevronDown,
  ChevronUp,
  X,
  MessageSquarePlus,
  Send,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Review {
  id: string;
  name: string;
  role: string;
  location: string;
  plan: string;
  category: "all" | "classic" | "power" | "family";
  rating: number;
  quote: string;
  avatar: string;
  tags: string[];
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "1",
    name: "Suren Dharmaratne",
    role: "Senior Tech Director",
    location: "Colombo 03",
    plan: "Classic Plan • 6 Mos Subscriber",
    category: "classic",
    rating: 5,
    quote:
      "Before nu3go, breakfast was whatever oily short-eats were nearby. By 2:00 PM, brain fog was guaranteed. With nu3go delivering fresh, ready-to-eat breakfast straight to my desk by 7:30 AM, my workday focus has stayed rock steady. It pays for itself in sheer productivity.",
    avatar: "/images/insta-3.jpg",
    tags: ["High Mental Focus", "Free Weekday Delivery"],
  },
  {
    id: "2",
    name: "Dinuka Mendis",
    role: "CrossFit Coach & Athlete",
    location: "Wattala",
    plan: "Power Plan • 1 Year Subscriber",
    category: "power",
    rating: 5,
    quote:
      "Hitting 170g of clean protein while coaching clients was a daily nightmare of dry chicken and meal-prep containers. nu3go's Power Plan overnight oats and high-protein pastas are weighed with macro accuracy and actually taste like gourmet meals.",
    avatar: "/images/insta-6.jpg",
    tags: ["40g+ Protein/Meal", "Wattala Morning Delivery"],
  },
  {
    id: "3",
    name: "Kavindi Ranasinghe",
    role: "Product Manager & Mother",
    location: "Colombo",
    plan: "Iskool & Classic Combo",
    category: "family",
    rating: 5,
    quote:
      "Balancing morning client standups and packing healthy food for my school-going kids was our family's biggest stress point. The Iskool plan delivers kid-approved, wholesome breakfasts that my kids actually devour with smiles every weekday morning.",
    avatar: "/images/insta-11.jpg",
    tags: ["Stress-Free Mornings", "100% Wholesome Kids Fuel"],
  },
  {
    id: "4",
    name: "Dilshan Perera",
    role: "Startup Founder",
    location: "Colombo 07",
    plan: "fourtiG Plan • 4 Mos Subscriber",
    category: "classic",
    rating: 5,
    quote:
      "The meal swap feature is a lifesaver. On days I have late investor meetings or travel, I swap meals with two clicks. 7:30 AM delivery never missed a beat, and 100% free delivery with no surprise charges is so rare in Sri Lanka.",
    avatar: "/images/insta-1.jpg",
    tags: ["Meal Swap Flexibility", "No Hidden Delivery Fees"],
  },
  {
    id: "5",
    name: "Anarkali Senanayake",
    role: "Corporate Attorney",
    location: "Bambalapitiya",
    plan: "Classic Plan • 5 Mos Subscriber",
    category: "classic",
    rating: 5,
    quote:
      "The overnight fruit & nut oats and chapathi rolls are simply incredible. Warm, fresh, and zero MSG or reused oil. You actually feel light, energised, and ready for long court hearings without that heavy post-breakfast slump.",
    avatar: "/images/insta-8.jpg",
    tags: ["Zero MSG & Clean Oils", "7:30 AM On-Time"],
  },
  {
    id: "6",
    name: "Rohan Wickramasinghe",
    role: "FinTech Lead",
    location: "Kollupitiya",
    plan: "Power Plan • 7 Mos Subscriber",
    category: "power",
    rating: 5,
    quote:
      "As someone working US shift hours, my morning meal rhythm was completely broken. nu3go gave me consistent, chef-crafted high-protein breakfast right at my doorstep every single weekday. Game changer for Sri Lanka.",
    avatar: "/images/insta-9.jpg",
    tags: ["Chef-Crafted Fresh", "Precision Nutrition"],
  },
  {
    id: "7",
    name: "Tharindu Jayawardena",
    role: "Software Architect",
    location: "Dehiwala",
    plan: "Classic Plan • 3 Mos Subscriber",
    category: "classic",
    rating: 5,
    quote:
      "Switching from street food breakfast to nu3go completely eradicated my morning sluggishness. The meal packaging is airtight and leak-proof. By the time I start my first Zoom call at 8:00 AM, I'm fully fueled.",
    avatar: "/images/insta-2.jpg",
    tags: ["Airtight Thermal Pack", "High Focus"],
  },
  {
    id: "8",
    name: "Michelle Fernando",
    role: "Pilates Instructor",
    location: "Mount Lavinia",
    plan: "Power Plan • 9 Mos Subscriber",
    category: "power",
    rating: 5,
    quote:
      "I appreciate that they use cold-pressed single-pour oils and zero refined sugar. You can taste the real ingredients. The double-egg breakfast scramble and chia seed bowls are top tier.",
    avatar: "/images/insta-10.jpg",
    tags: ["Botanical Oils Only", "Zero Refined Sugar"],
  },
  {
    id: "9",
    name: "Dr. Asanka Karunaratne",
    role: "Physician & Father",
    location: "Colombo 05",
    plan: "Iskool Plan • 6 Mos Subscriber",
    category: "family",
    rating: 5,
    quote:
      "As a doctor, nutritional adequacy for growing school kids is non-negotiable. nu3go's Iskool plan hits all micronutrient and clean carbohydrate requirements. Convenient, hygienic, and thoroughly reliable.",
    avatar: "/images/insta-12.jpg",
    tags: ["Doctor Approved", "Nutrient Dense"],
  },
];

const CATEGORIES = [
  { key: "all", label: "All Reviews" },
  { key: "classic", label: "Classic Vitality" },
  { key: "power", label: "Power Athletes" },
  { key: "family", label: "Family & Iskool" },
] as const;

export function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  // Review Submission Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    location: "Colombo",
    plan: "Classic Plan",
    category: "classic" as "all" | "classic" | "power" | "family",
    rating: 5,
    quote: "",
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const filteredReviews =
    activeCategory === "all"
      ? reviews
      : reviews.filter((r) => r.category === activeCategory);

  // Initial display limit: 3 reviews; when expanded, show all filtered reviews
  const visibleReviews = showAll ? filteredReviews : filteredReviews.slice(0, 3);
  const hasMoreReviews = filteredReviews.length > 3;
  const remainingCount = filteredReviews.length - 3;

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Header entrance
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // 2. Stats bar entrance
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          { opacity: 0, y: 25, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // 3. Grid cards entrance
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      role: formData.role.trim() || "Verified Subscriber",
      location: formData.location.trim() || "Colombo",
      plan: `${formData.plan} • Subscriber`,
      category: formData.category,
      rating: formData.rating,
      quote: formData.quote.trim(),
      avatar: "/images/insta-7.jpg",
      tags: ["Verified Subscriber", "Community Review"],
    };

    setReviews([newReview, ...reviews]);
    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setFormData({
        name: "",
        role: "",
        location: "Colombo",
        plan: "Classic Plan",
        category: "classic",
        rating: 5,
        quote: "",
      });
    }, 1800);
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#FAF9F5] pt-20 sm:pt-24 lg:pt-28 pb-10 sm:pb-12 lg:pb-14 overflow-hidden text-neutral-900 border-t border-neutral-200/80"
    >
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* ─── Section Header ─── */}
        <div ref={headerRef} className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#36D068]/15 border border-[#36D068]/30 mb-4">
            <Star className="w-3.5 h-3.5 text-[#36D068] fill-[#36D068]" />
            <span className="font-oswald text-xs font-bold tracking-[0.2em] uppercase text-emerald-800">
              COMMUNITY REVIEWS
            </span>
          </div>

          <h2 className="font-oswald text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-neutral-900 tracking-tight leading-[1.06] mb-5">
            Loved by Hundreds of <br />
            <span className="text-[#36D068]">Colombo Morning Achievers</span>
          </h2>

          <p className="text-neutral-600 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
            From busy corporate leaders in Colombo to athletes and families in Wattala, discover how
            nu3go delivers fresh, ready-to-eat weekday breakfast directly to their doorstep by <strong>7:30 AM</strong>.
          </p>
        </div>

        {/* ─── Metric Trust Bar ─── */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-oswald text-2xl sm:text-3xl font-black text-neutral-900 block tracking-tight">
              4.9 / 5.0
            </span>
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider font-oswald">
              Subscriber Rating
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm text-center">
            <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center text-[#36D068]">
              <Clock className="w-5 h-5 text-[#36D068]" />
            </div>
            <span className="font-oswald text-2xl sm:text-3xl font-black text-neutral-900 block tracking-tight">
              7:30 AM
            </span>
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider font-oswald">
              Guaranteed Delivery
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm text-center">
            <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center text-[#36D068]">
              <Truck className="w-5 h-5 text-[#36D068]" />
            </div>
            <span className="font-oswald text-2xl sm:text-3xl font-black text-neutral-900 block tracking-tight">
              100% Free
            </span>
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider font-oswald">
              Zero Hidden Shipping
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm text-center">
            <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center text-[#36D068]">
              <ShieldCheck className="w-5 h-5 text-[#36D068]" />
            </div>
            <span className="font-oswald text-2xl sm:text-3xl font-black text-neutral-900 block tracking-tight">
              150,000+
            </span>
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider font-oswald">
              Fresh Meals Delivered
            </span>
          </div>
        </div>

        {/* ─── Category Filter Pills ─── */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setActiveCategory(cat.key);
                setShowAll(false);
              }}
              className={`px-5 py-2.5 rounded-full font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeCategory === cat.key
                  ? "bg-neutral-950 text-white shadow-md scale-105"
                  : "bg-white text-neutral-700 border border-neutral-300/80 hover:bg-neutral-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ─── Reviews Grid ─── */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10"
        >
          {visibleReviews.map((review) => (
            <div
              key={review.id}
              className="relative bg-white rounded-3xl p-7 sm:p-8 border border-neutral-200/90 shadow-sm hover:shadow-xl hover:border-[#36D068]/50 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Top Row: Stars + Quote Icon */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-neutral-200 group-hover:text-[#36D068]/30 transition-colors" />
                </div>

                {/* Plan Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-bold uppercase tracking-wider font-oswald mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#36D068]" />
                  <span>{review.plan}</span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-neutral-700 text-sm sm:text-[15px] leading-relaxed font-normal mb-6">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              {/* Bottom Row: User Info + Tags */}
              <div className="pt-5 border-t border-neutral-100">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#36D068] shrink-0 shadow-sm">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-oswald text-base font-bold text-neutral-900 tracking-tight truncate">
                        {review.name}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0" />
                    </div>
                    <p className="text-xs text-neutral-500 font-light truncate">
                      {review.role} &bull; {review.location}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-oswald tracking-wide"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── View More / Show Less Button ─── */}
        {hasMoreReviews && (
          <div className="flex justify-center mb-14 sm:mb-16">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-oswald text-xs sm:text-sm font-bold uppercase tracking-[0.15em] bg-white text-neutral-900 border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50 transition-all duration-300 shadow-sm cursor-pointer group"
            >
              <span>{showAll ? "SHOW LESS REVIEWS" : `VIEW MORE REVIEWS (${remainingCount} MORE)`}</span>
              {showAll ? (
                <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              )}
            </button>
          </div>
        )}

        {/* ─── Bottom Banner: Share Your Review Action (Matching Image Styling) ─── */}
        <div className="bg-neutral-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-white/10">
          <div className="text-center md:text-left">
            <span className="font-oswald text-xs font-bold tracking-[0.2em] uppercase text-[#36D068] block mb-1">
              SHARE YOUR BREAKFAST STORY
            </span>
            <h3 className="font-oswald text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
              Are You a Daily nu3go Subscriber?
            </h3>
            <p className="text-white/70 text-xs sm:text-sm mt-1 font-light max-w-xl">
              Help Colombo &amp; Wattala professionals discover healthy morning routines. Share your honest experience with our community.
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-8 sm:px-9 py-4 rounded-xl font-oswald text-xs sm:text-sm font-bold uppercase tracking-[0.15em] bg-[#36D068] text-neutral-950 hover:bg-emerald-400 transition-all duration-300 shadow-lg shadow-[#36D068]/20 group cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Write a Review</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Interactive "Write a Review" Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 text-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmitted ? (
              <div className="py-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#36D068]/20 text-[#36D068] flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-oswald text-2xl font-bold uppercase text-neutral-900 mb-2">
                  Thank You for Your Review!
                </h3>
                <p className="text-neutral-600 text-sm max-w-sm">
                  Your review has been successfully posted to our community. Thank you for powering nu3go mornings!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#36D068]/20 text-[#36D068] flex items-center justify-center">
                    <MessageSquarePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold font-oswald text-[#36D068] tracking-widest uppercase block">
                      SUBSCRIBER FEEDBACK
                    </span>
                    <h3 className="font-oswald text-xl sm:text-2xl font-black uppercase text-neutral-900">
                      Share Your Breakfast Experience
                    </h3>
                  </div>
                </div>

                <p className="text-neutral-500 text-xs mb-6 font-light">
                  Tell us about your weekday mornings with nu3go. We value your honest feedback!
                </p>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-oswald font-bold uppercase text-neutral-700 tracking-wider mb-1.5">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="p-1 cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              (hoverRating !== null ? star <= hoverRating : star <= formData.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-neutral-500 font-semibold ml-2 font-oswald">
                        {formData.rating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Name & Role Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-oswald font-bold uppercase text-neutral-700 tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Suren Dharmaratne"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#36D068] focus:ring-1 focus:ring-[#36D068]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-oswald font-bold uppercase text-neutral-700 tracking-wider mb-1">
                        Role / Profession
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="e.g. Tech Lead, Athlete"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#36D068] focus:ring-1 focus:ring-[#36D068]"
                      />
                    </div>
                  </div>

                  {/* Location & Plan Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-oswald font-bold uppercase text-neutral-700 tracking-wider mb-1">
                        Delivery Area
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Colombo 03, Wattala"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#36D068] focus:ring-1 focus:ring-[#36D068]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-oswald font-bold uppercase text-neutral-700 tracking-wider mb-1">
                        Your Plan
                      </label>
                      <select
                        value={formData.plan}
                        onChange={(e) => {
                          const plan = e.target.value;
                          let category: "all" | "classic" | "power" | "family" = "classic";
                          if (plan.includes("Power")) category = "power";
                          else if (plan.includes("Iskool")) category = "family";
                          setFormData({ ...formData, plan, category });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm bg-white focus:outline-none focus:border-[#36D068] focus:ring-1 focus:ring-[#36D068]"
                      >
                        <option value="Classic Plan">Classic Plan</option>
                        <option value="Power Plan">Power Plan</option>
                        <option value="fourtiG Plan">fourtiG Plan</option>
                        <option value="Iskool Plan">Iskool Plan</option>
                      </select>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-xs font-oswald font-bold uppercase text-neutral-700 tracking-wider mb-1">
                      Your Review *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.quote}
                      onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                      placeholder="Share your experience with nu3go weekday mornings, taste, freshness, and delivery..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-[#36D068] focus:ring-1 focus:ring-[#36D068] resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-oswald text-xs font-bold uppercase tracking-wider bg-[#36D068] text-neutral-950 hover:bg-emerald-400 transition-colors shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Review</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
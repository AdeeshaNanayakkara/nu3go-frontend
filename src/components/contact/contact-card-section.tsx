"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INSTAGRAM_URL = "https://www.instagram.com/nu3.go?stkn=eGhwMjVvaGtsdDVv";

export function ContactCardSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 7000);
    }, 800);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
        },
        defaults: { ease: "power3.out", force3D: true },
      });

      if (leftColRef.current) {
        tl.fromTo(
          leftColRef.current,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.9 }
        );
      }

      if (rightColRef.current) {
        tl.fromTo(
          rightColRef.current,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.9 },
          "<0.1"
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative w-full bg-[#F7F6F2] pt-6 sm:pt-10 lg:pt-14 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto">
        {/* ─── Main White Contact Card Section (Below Hero Section Curve) ─── */}
        <div
          id="contact-form-card"
          ref={containerRef}
          className="relative z-30 bg-white rounded-3xl sm:rounded-[36px] shadow-2xl shadow-neutral-900/10 border border-neutral-200/80 p-6 sm:p-10 lg:p-14 xl:p-16 overflow-hidden will-change-[transform,opacity]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16">
            {/* ══════════════════════════════════════════════════════════
                LEFT COLUMN: Corporate Office, Press & Socials
                (order-2 on mobile/tablet, order-1 on desktop lg:)
               ══════════════════════════════════════════════════════════ */}
            <div
              ref={leftColRef}
              className="order-2 lg:order-1 lg:col-span-4 flex flex-col justify-between space-y-10 lg:space-y-12 pt-10 lg:pt-0 border-t lg:border-t-0 lg:border-r border-neutral-200/80 lg:pr-10 xl:pr-12 will-change-[transform,opacity]"
            >
              {/* Section 1: Corporate Office */}
              <div>
                <h3 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-neutral-900 tracking-tight leading-none mb-4">
                  CORPORATE OFFICE
                </h3>
                <div className="space-y-3.5 text-xs sm:text-sm text-neutral-600">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#36D068] shrink-0 mt-0.5" />
                    <span>No. 45, Alfred House Gardens, Colombo 03, Sri Lanka.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#36D068] shrink-0" />
                    <a href="tel:+94112345678" className="hover:text-[#36D068] transition-colors">
                      +94 11 234 5678
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#36D068] shrink-0" />
                    <a href="mailto:hello@nu3go.com" className="hover:text-[#36D068] transition-colors">
                      hello@nu3go.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Section 2: Press & Inquiries */}
              <div>
                <h3 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-neutral-900 tracking-tight leading-none mb-1.5">
                  PRESS INQUIRIES
                </h3>
                <span className="font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500 block mb-3.5">
                  MATTEO DAMIAN &amp; PARTNERSHIPS
                </span>
                <div className="space-y-3.5 text-xs sm:text-sm text-neutral-600">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#36D068] shrink-0" />
                    <a href="tel:+94771234567" className="hover:text-[#36D068] transition-colors">
                      +94 77 123 4567
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#36D068] shrink-0" />
                    <a href="mailto:press@nu3go.com" className="hover:text-[#36D068] transition-colors">
                      press@nu3go.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Section 3: Stay Connected Social Links */}
              <div>
                <h3 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-neutral-900 tracking-tight leading-none mb-4">
                  STAY CONNECTED
                </h3>
                <div className="flex items-center gap-3">
                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="w-9 h-9 rounded-full bg-[#36D068] hover:bg-[#2EB859] text-neutral-950 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-3.5 h-3.5 fill-current">
                      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-9 h-9 rounded-full bg-[#36D068] hover:bg-[#2EB859] text-neutral-950 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-current">
                      <path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256c0 120 82.7 220.8 194.2 248.5V334.2h-52.8V256h52.8v-33.7c0-87.1 39.4-127.5 125-127.5 16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1-42 0-58.2 15.9-58.2 57.2V256h84.8l-13.2 78.2h-71.6V508.9C433.8 485.4 512 379.9 512 256z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 rounded-full bg-[#36D068] hover:bg-[#2EB859] text-neutral-950 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 fill-current">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  {/* <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-9 h-9 rounded-full bg-[#36D068] hover:bg-[#2EB859] text-neutral-950 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="w-4 h-4 fill-current">
                      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.583V175.185l142.739 81.241-142.739 81.24z" />
                    </svg>
                  </a> */}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                RIGHT COLUMN: Interactive Contact Form ("WE LOVE TO HEAR FROM YOU")
                (order-1 on mobile/tablet, order-2 on desktop lg:)
               ══════════════════════════════════════════════════════════ */}
            <div
              ref={rightColRef}
              className="order-1 lg:order-2 lg:col-span-8 flex flex-col will-change-[transform,opacity]"
            >
              {/* Heading */}
              <h2 className="font-oswald text-3xl sm:text-4xl lg:text-[40px] font-black uppercase text-neutral-900 tracking-tight leading-none mb-3">
                WE LOVE TO HEAR FROM YOU
              </h2>

              {/* Description */}
              <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed mb-8 font-normal">
                Whether you need guidance choosing the right meal subscription, customized nutrition advice, corporate catering, or delivery schedule support, our team is ready to assist you.
              </p>

              {/* Form Success State */}
              {submitted ? (
                <div className="bg-[#36D068]/15 border border-[#36D068] text-neutral-900 p-6 rounded-2xl flex items-center gap-3.5 mb-6 animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="w-6 h-6 text-[#36D068] shrink-0" />
                  <div>
                    <span className="font-bold text-sm sm:text-base block">
                      Message Sent Successfully!
                    </span>
                    <span className="text-xs sm:text-sm text-neutral-600 block mt-0.5">
                      Thank you for contacting Nu3Go. Our wellness team will reach out to you within 24 hours.
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                      First Name <span className="text-[#36D068]">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Your first name"
                      className="w-full bg-[#F9F9F9] border border-neutral-200/90 focus:border-neutral-900 focus:bg-white rounded-lg px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                      Last Name <span className="text-[#36D068]">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Your last name"
                      className="w-full bg-[#F9F9F9] border border-neutral-200/90 focus:border-neutral-900 focus:bg-white rounded-lg px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Row 2: Email */}
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                    Email <span className="text-[#36D068]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full bg-[#F9F9F9] border border-neutral-200/90 focus:border-neutral-900 focus:bg-white rounded-lg px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden transition-all duration-200"
                  />
                </div>

                {/* Row 3: Phone Number (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                    Phone Number <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-[#F9F9F9] border border-neutral-200/90 focus:border-neutral-900 focus:bg-white rounded-lg px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden transition-all duration-200"
                  />
                </div>

                {/* Row 4: Subject */}
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                    Subject <span className="text-[#36D068]">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Subscription Meal Plan Inquiry"
                    className="w-full bg-[#F9F9F9] border border-neutral-200/90 focus:border-neutral-900 focus:bg-white rounded-lg px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden transition-all duration-200"
                  />
                </div>

                {/* Row 5: Comment or Message (Required) */}
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                    Comment or Message <span className="text-[#36D068]">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message or inquiry here..."
                    className="w-full bg-[#F9F9F9] border border-neutral-200/90 focus:border-neutral-900 focus:bg-white rounded-lg px-4 py-3 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-hidden transition-all duration-200 resize-y"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-block bg-[#36D068] hover:bg-[#2EB859] text-neutral-950 px-9 py-3.5 rounded-xs font-oswald text-xs sm:text-sm font-bold tracking-[0.18em] uppercase transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? "SENDING..." : "SUBMIT"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

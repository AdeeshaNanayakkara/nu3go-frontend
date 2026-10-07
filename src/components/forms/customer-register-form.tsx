"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Mail, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Leaf
} from "lucide-react";
import { authService } from "@/services/api/auth.service";
import { GoogleSignInButton } from "@/components/shared/google-sign-in-button";
import { Logo } from "@/components/shared/logo";

export function CustomerRegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!agreeTerms) {
      setError("Please agree to the terms of service to proceed.");
      return;
    }

    setIsLoading(true);

    try {
      // Register customer account — backend sends OTP code to their email
      await authService.register({ email, password, role: "CUSTOMER" });

      // Redirect user to the OTP Email Verification page
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[920px] xl:max-w-[960px] mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/60 border border-white/20 ring-1 ring-black/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 font-poppins">
      
      {/* ══════════════════════════════════════════════════════════
          LEFT PANEL: Nu3Go Brand Showcase (Landing Page Style)
          ══════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-5 bg-[#0B3B17] p-5 sm:p-6 lg:p-7 text-white relative flex flex-col justify-between overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#36D068]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-[#36D068]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Brand Logo */}
          <div className="mb-3">
            <Logo variant="white" imageClassName="h-6 sm:h-6.5 w-auto object-contain" />
          </div>

          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-1.5 bg-[#36D068]/20 border border-[#36D068]/40 px-2.5 py-0.5 rounded-full text-[#36D068] font-oswald text-[10px] font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3 h-3 text-[#36D068]" />
            <span>JOIN THE NU3GO COMMUNITY</span>
          </div>

          <h2 className="font-oswald text-xl sm:text-2xl lg:text-[23px] font-black uppercase tracking-tight text-white leading-snug mb-1.5">
            START YOUR HEALTHY MEAL SUBSCRIPTION
          </h2>

          <p className="text-emerald-100/80 text-[11px] sm:text-xs font-normal leading-relaxed mb-2">
            Get nutritious, macro-balanced meals delivered fresh to your door every weekday.
          </p>

          {/* Dish Image Showcase */}
          <div className="relative w-full h-28 sm:h-32 lg:h-36 my-1.5 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#36D068]/10 rounded-2xl blur-xl" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 transition-transform duration-500 hover:scale-105">
              <Image
                src="/images/power1.png"
                alt="Nu3Go Power High Protein Bowl"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="relative z-10 space-y-1.5 pt-2.5 border-t border-white/10 text-[11px] sm:text-xs text-emerald-100/90 font-medium">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#36D068] shrink-0" />
            <span>Power &amp; Classic Macro-Calculated Meals</span>
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5 text-[#36D068] shrink-0" />
            <span>100% Organic &amp; Farm Fresh Ingredients</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#36D068] shrink-0" />
            <span>No Commitments • Pause or Cancel Anytime</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RIGHT PANEL: Customer Registration Form
          ══════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-7 p-5 sm:p-6 lg:p-7 flex flex-col justify-between bg-gradient-to-b from-[#FAF9F5] to-white">
        <div>
          {/* Header */}
          <div className="mb-2.5 sm:mb-3">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0B3B17]/10 border border-[#0B3B17]/20 text-[#0B3B17] font-oswald text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>START YOUR WELLNESS JOURNEY</span>
            </div>

            <h1 className="font-oswald text-2xl sm:text-[26px] font-black uppercase text-neutral-900 tracking-tight leading-none mb-1">
              CREATE CUSTOMER ACCOUNT
            </h1>
            <p className="text-slate-600 text-xs">
              Sign up in seconds to choose your plan and customize meals.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-2.5 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-400/30 px-3 py-1.5 text-red-600 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign Up Button */}
          <div className="mb-2.5">
            <GoogleSignInButton label="Sign Up with Google" />
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2.5">
            <div className="w-full border-t border-slate-200" />
            <span className="bg-[#FAF9F5] px-3 py-0.5 rounded-full text-slate-500 text-[10px] uppercase font-oswald tracking-wider absolute">
              or register with email
            </span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-0.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="customer-register-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-8.5 sm:h-9 pl-9 pr-3 rounded-lg border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-xs font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-0.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="customer-register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full h-8.5 sm:h-9 pl-9 pr-9 rounded-lg border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-0.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="customer-register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-8.5 sm:h-9 pl-9 pr-9 rounded-lg border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#0B3B17] rounded cursor-pointer"
              />
              <label htmlFor="agree-terms" className="text-[11px] text-slate-600 font-medium leading-tight cursor-pointer">
                I agree to the Nu3Go Terms and Privacy Policy.
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="customer-register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full h-9.5 sm:h-10 bg-[#0B3B17] hover:bg-[#124D20] active:scale-[0.99] text-white font-oswald text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-all shadow-md shadow-[#0B3B17]/20 flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-1"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  CREATING ACCOUNT...
                </span>
              ) : (
                <>
                  <span>CREATE ACCOUNT &amp; GET STARTED</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#36D068]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info & Switch Auth */}
        <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-center space-y-1">
          <p className="text-xs text-slate-600 font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#15803D] hover:text-[#0B3B17] hover:underline ml-1 font-oswald uppercase tracking-wide"
            >
              LOG IN
            </Link>
          </p>

          <div>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 text-[10.5px] text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <span>Staff or Administrator? Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

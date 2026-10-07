"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Mail,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Truck
} from "lucide-react";
import { authService } from "@/services/api/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { GoogleSignInButton } from "@/components/shared/google-sign-in-button";
import { Logo } from "@/components/shared/logo";

import { useSearchParams } from "next/navigation";

interface CustomerLoginFormProps {
  /** Shown when the user was redirected here due to an expired session */
  sessionExpiredMessage?: string | null;
  /** Optional initial callback URL passed from page */
  initialCallbackUrl?: string | null;
}

function getSafeRedirectUrl(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }
  return fallback;
}

export function CustomerLoginForm({
  sessionExpiredMessage,
  initialCallbackUrl = null,
}: CustomerLoginFormProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const effectiveCallback =
    initialCallbackUrl ||
    searchParams.get("callbackUrl") ||
    searchParams.get("redirect") ||
    searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdminDetected, setIsAdminDetected] = useState(false);

  // If user is already authenticated, redirect customer or notify admin
  useEffect(() => {
    if (user) {
      const isAdmin = user.role?.toUpperCase() === "ADMIN";
      if (isAdmin) {
        setIsAdminDetected(true);
        setError("Administrator account detected. Please use the Admin Portal to sign in.");
        return;
      }
      const target = getSafeRedirectUrl(effectiveCallback, "/");
      router.replace(target);
    }
  }, [user, router, effectiveCallback]);

  const [isUnverified, setIsUnverified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAdminDetected(false);
    setIsUnverified(false);
    setIsLoading(true);

    const cleanEmail = email.trim();

    try {
      const loggedInUser = await authService.login({ email: cleanEmail, password });

      // If user is an admin attempting to sign in on customer portal
      if (loggedInUser.role?.toUpperCase() === "ADMIN") {
        await useAuthStore.getState().logout();
        setIsAdminDetected(true);
        setError("Administrator account detected. Please use the Admin Portal to sign in.");
        return;
      }

      setUser(loggedInUser);
      const target = getSafeRedirectUrl(effectiveCallback, "/");
      window.location.replace(target);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Sign in failed. Please check your credentials.";
      setError(errorMsg);

      if (errorMsg.toLowerCase().includes("not verified")) {
        setIsUnverified(true);
      }
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
            <span>NUTRITION-FIRST LIFESTYLE</span>
          </div>

          <h2 className="font-oswald text-xl sm:text-2xl lg:text-[23px] font-black uppercase tracking-tight text-white leading-snug mb-1.5">
            FUEL YOUR BODY WITH CHEF-CRAFTED NUTRITION
          </h2>

          <p className="text-emerald-100/80 text-[11px] sm:text-xs font-normal leading-relaxed mb-2">
            Manage your daily macro deliveries and customize your weekly meal plans.
          </p>

          {/* Dish Image Showcase */}
          <div className="relative w-full h-28 sm:h-32 lg:h-36 my-1.5 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#36D068]/10 rounded-2xl blur-xl" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 transition-transform duration-500 hover:scale-105">
              <Image
                src="/images/hero-dish.png"
                alt="Nu3Go Macro Super Bowl"
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
            <CheckCircle2 className="w-3.5 h-3.5 text-[#36D068] shrink-0" />
            <span>40g+ High Protein Macro Bowls</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-[#36D068] shrink-0" />
            <span>Free Doorstep Morning Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-[#36D068] shrink-0" />
            <span>Pause, Skip, or Change Anytime</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RIGHT PANEL: Customer Sign In Form
          ══════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-7 p-5 sm:p-6 lg:p-7 flex flex-col justify-between bg-gradient-to-b from-[#FAF9F5] to-white">
        <div>
          {/* Header */}
          <div className="mb-3 sm:mb-4">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0B3B17]/10 border border-[#0B3B17]/20 text-[#0B3B17] font-oswald text-[10px] font-bold uppercase tracking-wider mb-1">
              <span>WELCOME BACK</span>
            </div>

            <h1 className="font-oswald text-2xl sm:text-[26px] font-black uppercase text-neutral-900 tracking-tight leading-none mb-1">
              CUSTOMER SIGN IN
            </h1>
            <p className="text-slate-600 text-xs">
              Enter your credentials or continue with Google.
            </p>
          </div>

          {/* Session Expired Banner */}
          {sessionExpiredMessage && !error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-400/30 px-3 py-2 text-amber-700 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{sessionExpiredMessage}</span>
            </div>
          )}

          {/* Administrator Account Detected Alert Banner */}
          {isAdminDetected && (
            <div className="mb-3 rounded-2xl bg-amber-500/10 border border-amber-400/40 p-3.5 text-xs text-amber-950 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <span className="font-bold font-oswald text-xs uppercase tracking-wide block text-amber-950">
                    Administrator Account Detected
                  </span>
                  <p className="text-[11.5px] text-amber-800 leading-relaxed font-medium">
                    This login form is for customer accounts only. Please use the dedicated Administrator Portal to sign in.
                  </p>
                  <div className="pt-1">
                    <Link
                      href="/admin/login"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B3B17] hover:bg-[#124D20] text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                    >
                      <Lock className="w-3 h-3 text-[#36D068]" />
                      <span>Go to Admin Portal &rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && !isAdminDetected && (
            <div className="mb-3 rounded-lg bg-red-500/10 border border-red-400/30 p-2.5 text-xs">
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
              {isUnverified && (
                <div className="mt-2 pt-2 border-t border-red-300/30 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-600">Need to enter your OTP?</span>
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(email.trim())}`}
                    className="inline-flex items-center gap-1 font-bold text-[#15803D] hover:text-[#0B3B17] hover:underline font-oswald text-[11px] uppercase tracking-wider"
                  >
                    <span>Verify Account Now &rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="mb-3">
            <GoogleSignInButton
              label="Sign In with Google"
              callbackUrl={effectiveCallback}
              preventAdminLogin
              onAdminDetected={() => {
                setIsAdminDetected(true);
                setError("Administrator account detected. Please use the Admin Portal to sign in.");
              }}
            />
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-slate-200" />
            <span className="bg-[#FAF9F5] px-3 py-0.5 rounded-full text-slate-500 text-[10px] uppercase font-oswald tracking-wider absolute">
              or sign in with email
            </span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="customer-login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-9 sm:h-9.5 pl-9 pr-3 rounded-lg border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-xs font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-[#15803D] hover:text-[#0B3B17] hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="customer-login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 sm:h-9.5 pl-9 pr-10 rounded-lg border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-xs font-medium"
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

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#0B3B17] rounded cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="customer-login-submit"
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
                  SIGNING IN...
                </span>
              ) : (
                <>
                  <span>SIGN IN TO DASHBOARD</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#36D068]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info & Switch Auth */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 text-center space-y-1">
          <p className="text-xs text-slate-600 font-medium">
            Don&apos;t have an account yet?{" "}
            <Link
              href={
                effectiveCallback
                  ? `/register?callbackUrl=${encodeURIComponent(effectiveCallback)}`
                  : "/register"
              }
              className="font-bold text-[#15803D] hover:text-[#0B3B17] hover:underline ml-1 font-oswald uppercase tracking-wide"
            >
              CREATE AN ACCOUNT
            </Link>
          </p>

          <div>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 text-[10.5px] text-slate-400 hover:text-slate-600 font-medium transition-colors"
            >
              <ShieldAlert className="w-3 h-3 text-slate-400" />
              <span>Staff or Administrator? Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

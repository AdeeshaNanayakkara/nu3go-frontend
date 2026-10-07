"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, ShieldCheck, ArrowLeft, Mail } from "lucide-react";
import { authService } from "@/services/api/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const user = await authService.verifyOTP(email.trim(), otp.trim());
      setUser(user);
      setSuccess("Email verified successfully! Redirecting...");

      const destination = user.role?.toUpperCase() === "ADMIN" ? "/admin" : "/";
      setTimeout(() => window.location.replace(destination), 1200);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Verification failed. Please check your code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl shadow-black/60 border border-white/20 ring-1 ring-black/10 p-7 sm:p-10 font-poppins">
      {/* Icon & Title */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B3B17]/10 text-[#0B3B17] mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-none mb-2 font-oswald uppercase">
          VERIFY EMAIL ADDRESS
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-sm mx-auto">
          We&apos;ve sent a 6-digit verification code to your email. Enter it below to activate your account.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-400/30 px-3.5 py-3 text-red-600 text-xs sm:text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#36D068]/15 border border-[#36D068]/40 px-3.5 py-3 text-[#0B3B17] text-xs sm:text-sm font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#36D068]" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="verify-email" className="block text-xs font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="verify-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* OTP Code */}
        <div>
          <label htmlFor="verify-otp" className="block text-xs font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1.5">
            Verification Code (OTP)
          </label>
          <input
            id="verify-otp"
            type="text"
            required
            maxLength={10}
            value={otp}
            onChange={(e) => setOtp(e.target.value.trim())}
            placeholder="• • • • • •"
            className="w-full h-12 px-4 text-center tracking-[0.3em] font-bold text-xl rounded-xl border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm focus:outline-none focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
          />
        </div>

        {/* Submit button */}
        <button
          id="verify-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#0B3B17] hover:bg-[#124D20] active:scale-[0.99] text-white font-oswald text-base font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#0B3B17]/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              VERIFYING CODE...
            </span>
          ) : (
            "VERIFY & CONTINUE"
          )}
        </button>
      </form>

      <div className="flex items-center justify-between text-xs text-slate-600 mt-6 pt-4 border-t border-slate-200/80 font-medium">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#0B3B17] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>
        <Link
          href="/register"
          className="text-[#15803D] font-bold font-oswald uppercase tracking-wider hover:underline"
        >
          Resend / Register
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound, AlertCircle } from "lucide-react";
import { authService } from "@/services/api/auth.service";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"enter-email" | "reset-password">("enter-email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      // On success, transition to Step 2 (Reset Password form)
      setStep("reset-password");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "reset-password") {
    return <ResetPasswordForm initialEmail={email} />;
  }

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl shadow-black/60 border border-white/20 ring-1 ring-black/10 p-7 sm:p-10 font-poppins">
      {/* Title & Subtitle */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#0B3B17]/10 text-[#0B3B17] flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-6 h-6" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-none mb-2 font-oswald uppercase">
          FORGOT PASSWORD
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm font-medium">
          Enter your registered email to receive a 6-digit verification OTP code.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-400/30 px-3.5 py-3 text-red-600 text-xs sm:text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold font-oswald uppercase tracking-wider text-slate-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#0B3B17] hover:bg-[#124D20] active:scale-[0.99] text-white font-oswald text-base font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#0B3B17]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              SENDING OTP...
            </span>
          ) : (
            "SEND RESET OTP"
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0B3B17] font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </form>
    </div>
  );
}

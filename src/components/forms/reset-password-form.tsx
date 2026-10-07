"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/services/api/auth.service";

interface ResetPasswordFormProps {
  initialEmail?: string;
}

export function ResetPasswordForm({ initialEmail = "" }: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail || emailFromQuery);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // 3-minute countdown timer (180 seconds)
  const [timerSeconds, setTimerSeconds] = useState<number>(180);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerSeconds(180);

    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start countdown interval on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpDigits];
    // Handle single digit
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setOtpDigits(digits);
    otpInputRefs.current[5]?.focus();
  };

  // Handle Resend OTP (3-minute gap requirement)
  const handleResendOTP = async () => {
    if (timerSeconds > 0 || isResending) return;
    if (!email) {
      setError("Please enter your email address to resend OTP.");
      return;
    }

    setIsResending(true);
    setError(null);
    setResendMessage(null);

    try {
      await authService.forgotPassword(email);
      setResendMessage("A new 6-digit OTP has been sent to your email.");
      startTimer();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Email address is required.");
      return;
    }

    const otp = otpDigits.join("");
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit OTP sent to your email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        email,
        new_password: newPassword,
        otp,
      });

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl shadow-black/60 border border-white/20 ring-1 ring-black/10 p-7 sm:p-10 font-poppins">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-none mb-2 font-oswald uppercase">
          RESET PASSWORD
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm font-medium">
          Enter the OTP sent to your email and set your new password.
        </p>
      </div>

      {success ? (
        <div className="text-center space-y-5 py-4">
          <div className="w-16 h-16 bg-[#36D068]/20 rounded-full flex items-center justify-center mx-auto text-[#36D068]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Password Reset Successfully!</h3>
            <p className="text-slate-600 text-sm font-medium">
              Your password has been updated. You can now log in with your new credentials.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex w-full h-12 bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold rounded-xl text-base items-center justify-center transition-all shadow-md shadow-[#36D068]/20"
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-12 px-4 rounded-xl border border-[#36D068]/60 bg-white/50 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white/80 focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-sm font-poppins backdrop-blur-sm"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full h-12 pl-4 pr-11 rounded-xl border border-[#36D068]/60 bg-white/50 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white/80 focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-sm font-poppins backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showNewPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full h-12 pl-4 pr-11 rounded-xl border border-[#36D068]/60 bg-white/50 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white/80 focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-sm font-poppins backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 6-Digit OTP Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
              6-Digit Security OTP Code
            </label>
            <div className="flex justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-12 text-center text-lg font-bold rounded-xl border border-[#36D068]/60 bg-white/60 text-slate-900 focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/30 transition-all shadow-xs"
                />
              ))}
            </div>
          </div>

          {/* Resend OTP with 3-minute gap timer */}
          <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
            <span className="text-slate-500 font-medium">Didn&apos;t receive the OTP?</span>
            {timerSeconds > 0 ? (
              <span className="text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                Resend in <span className="text-[#36D068] font-bold">{formatTime(timerSeconds)}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-[#36D068] font-semibold hover:underline transition-all disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>

          {/* Messages */}
          {resendMessage && (
            <p className="text-emerald-600 text-xs font-medium text-center bg-emerald-50 py-2 rounded-lg border border-emerald-200">
              {resendMessage}
            </p>
          )}

          {error && (
            <p className="text-red-500 text-xs font-medium text-center bg-red-50 py-2 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#36D068] hover:bg-[#2fc25e] active:scale-[0.99] text-white font-semibold text-base sm:text-lg rounded-xl transition-all shadow-md shadow-[#36D068]/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>

          <p className="text-center text-slate-600 text-xs sm:text-sm mt-4 font-medium">
            Remembered your password?{" "}
            <Link href="/login" className="text-[#36D068] font-semibold hover:underline transition-all ml-1">
              Sign In
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { authService } from "@/services/api/auth.service";
import { GoogleSignInButton } from "@/components/shared/google-sign-in-button";

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // Register user — backend sends OTP code to their email
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
    <div className="bg-white/45 backdrop-blur-xl rounded-[32px] border-[2.5px] border-[#36D068] shadow-2xl shadow-slate-900/10 px-7 py-7 sm:px-10 sm:py-8 w-full font-poppins">
      <div className="text-center mb-5 sm:mb-6">
        <h1 className="text-3xl sm:text-[36px] font-bold text-[#36D068] tracking-tight mb-1">
          Sign Up
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm font-medium">
          Let&apos;s get started with Nu3go
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-400/30 px-3 py-3 text-red-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
        {/* Email */}
        <input
          id="register-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full h-11 sm:h-12 px-4 rounded-xl border border-[#36D068]/60 bg-white/50 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white/80 focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-sm backdrop-blur-sm"
        />

        {/* Password */}
        <div className="relative">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
            className="w-full h-11 sm:h-12 pl-4 pr-12 rounded-xl border border-[#36D068]/60 bg-white/50 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white/80 focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-sm backdrop-blur-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full h-11 sm:h-12 pl-4 pr-12 rounded-xl border border-[#36D068]/60 bg-white/50 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white/80 focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-sm backdrop-blur-sm"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Sign Up button */}
        <button
          id="register-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-11 sm:h-12 bg-[#36D068] hover:bg-[#2fc25e] active:scale-[0.99] text-white font-semibold text-base rounded-xl transition-all shadow-md shadow-[#36D068]/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Account...
            </span>
          ) : (
            "Sign Up"
          )}
        </button>

        <p className="text-center text-slate-600 text-xs sm:text-sm font-medium">
          Already have an Account?{" "}
          <Link href="/login" className="text-[#36D068] font-semibold hover:underline ml-1">
            Log In
          </Link>
        </p>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="w-full border-t border-slate-400/50" />
          <span className="bg-white/60 backdrop-blur-md px-3 py-0.5 rounded-full text-slate-600 text-xs absolute font-medium">
            Or
          </span>
        </div>

        {/* Google */}
        <GoogleSignInButton label="Sign Up with Google" />
      </form>
    </div>
  );
}

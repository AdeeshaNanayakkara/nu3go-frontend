"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Clock } from "lucide-react";
import { authService } from "@/services/api/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { GoogleSignInButton } from "@/components/shared/google-sign-in-button";

interface LoginFormProps {
  /** Shown when the user was redirected here due to an expired session */
  sessionExpiredMessage?: string | null;
}

export function LoginForm({ sessionExpiredMessage }: LoginFormProps = {}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already authenticated and lands on login page, redirect them away immediately
  useEffect(() => {
    if (user) {
      const isAdmin = user.role?.toUpperCase() === "ADMIN";
      router.replace(isAdmin ? "/admin" : "/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loggedInUser = await authService.login({ email, password });
      setUser(loggedInUser);

      // Role-based replace redirect (replaces /login in browser history stack)
      const isAdmin = loggedInUser.role?.toUpperCase() === "ADMIN";
      const targetPath = isAdmin ? "/admin" : "/dashboard";
      window.location.replace(targetPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/45 backdrop-blur-xl rounded-[32px] border-[2.5px] border-[#36D068] shadow-2xl shadow-slate-900/10 px-7 py-8 sm:px-10 sm:py-10 w-full font-poppins">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-[36px] font-bold text-[#36D068] tracking-tight mb-1">
          Welcome
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm font-medium">
          We are happy to have you back!
        </p>
      </div>

      {/* Session expired banner */}
      {sessionExpiredMessage && !error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-400/30 px-3 py-3 text-amber-700 text-sm font-medium">
          <Clock className="w-4 h-4 shrink-0" />
          <span>{sessionExpiredMessage}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-400/30 px-3 py-3 text-red-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Email */}
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full h-12 px-4 rounded-xl border border-[#36D068]/60 bg-white/50 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white/80 focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-sm backdrop-blur-sm"
        />

        {/* Password */}
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full h-12 pl-4 pr-12 rounded-xl border border-[#36D068]/60 bg-white/50 text-slate-800 placeholder:text-slate-500 focus:outline-none focus:bg-white/80 focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all text-sm backdrop-blur-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#36D068] rounded cursor-pointer"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-[#36D068] font-medium hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Sign In button */}
        <button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#36D068] hover:bg-[#2fc25e] active:scale-[0.99] text-white font-semibold text-base rounded-xl transition-all shadow-md shadow-[#36D068]/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-400/50" />
          <span className="bg-white/60 backdrop-blur-md px-3 py-0.5 rounded-full text-slate-600 text-xs absolute font-medium">
            Or
          </span>
        </div>

        {/* Google Sign In */}
        <GoogleSignInButton label="Sign In with Google" />
      </form>

      <p className="text-center text-slate-600 text-xs sm:text-sm mt-6 font-medium">
        Don&apos;t have an Account?{" "}
        <Link href="/register" className="text-[#36D068] font-semibold hover:underline ml-1">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

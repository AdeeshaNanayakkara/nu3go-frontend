"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Clock, ShieldCheck, Lock, Mail, ArrowLeft } from "lucide-react";
import { authService } from "@/services/api/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { Logo } from "@/components/shared/logo";

interface AdminLoginFormProps {
  /** Shown when the user was redirected here due to an expired session */
  sessionExpiredMessage?: string | null;
}

export function AdminLoginForm({ sessionExpiredMessage }: AdminLoginFormProps = {}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as admin, redirect to admin dashboard immediately
  useEffect(() => {
    if (user) {
      const isAdmin = user.role?.toUpperCase() === "ADMIN";
      router.replace(isAdmin ? "/admin" : "/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loggedInUser = await authService.login({ email, password });
      setUser(loggedInUser);

      // Verify that the user has admin role
      const isAdmin = loggedInUser.role?.toUpperCase() === "ADMIN";
      if (!isAdmin) {
        // If customer credentials were entered here, redirect to landing page
        window.location.replace("/");
        return;
      }

      // Role-based replace redirect to admin panel
      window.location.replace("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please verify admin credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#0e441d] to-[#07240f] backdrop-blur-2xl rounded-3xl sm:rounded-[32px] border border-emerald-500/30 shadow-2xl shadow-black/80 p-6 sm:p-9 w-full font-poppins relative overflow-hidden ring-1 ring-emerald-400/20 text-white">
      {/* Ambient Glows */}
      <div className="absolute -right-16 -top-16 w-52 h-52 bg-[#36D068]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-[#36D068]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-6 sm:mb-7 relative z-10">
        {/* Brand Logo */}
        <div className="mb-3 flex justify-center">
          <Logo variant="white" imageClassName="h-6 sm:h-7 w-auto object-contain" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#36D068]/20 border border-[#36D068]/40 text-[#36D068] font-bold text-[11px] uppercase tracking-wider mb-2 font-oswald">
          <ShieldCheck className="w-3.5 h-3.5 text-[#36D068]" />
          <span>ADMINISTRATOR PORTAL</span>
        </div>

        <h1 className="text-2xl sm:text-[28px] font-black text-white tracking-tight leading-tight mb-1 font-oswald uppercase">
          ADMIN SIGN IN
        </h1>
        <p className="text-emerald-100/80 text-xs sm:text-sm font-normal">
          Enter your authorized administrator credentials
        </p>
      </div>

      {/* Session expired banner */}
      {sessionExpiredMessage && !error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-500/15 border border-amber-400/30 px-3.5 py-3 text-amber-200 text-xs sm:text-sm font-medium relative z-10">
          <Clock className="w-4 h-4 shrink-0 text-amber-300" />
          <span>{sessionExpiredMessage}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/20 border border-red-400/40 px-3.5 py-3 text-red-200 text-xs sm:text-sm font-medium relative z-10">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5 relative z-10">
        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-emerald-200 mb-1.5">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-emerald-400/70 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nu3go.com"
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-emerald-600/40 bg-[#051c0d]/80 hover:bg-[#051c0d] focus:bg-[#051c0d] text-white placeholder:text-emerald-300/40 focus:outline-none focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/30 transition-all text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-bold font-oswald uppercase tracking-wider text-emerald-200 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-emerald-400/70 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-12 pl-11 pr-12 rounded-xl border border-emerald-600/40 bg-[#051c0d]/80 hover:bg-[#051c0d] focus:bg-[#051c0d] text-white placeholder:text-emerald-300/40 focus:outline-none focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/30 transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-300/70 hover:text-white transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 text-emerald-100/90 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-[#36D068] rounded cursor-pointer"
            />
            <span>Remember session</span>
          </label>
          <Link href="/forgot-password" className="text-[#36D068] hover:text-emerald-300 font-semibold transition-colors hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          id="admin-login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#36D068] hover:bg-[#2EB959] active:scale-[0.99] text-[#0B3B17] font-oswald text-sm sm:text-base font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#36D068]/25 hover:shadow-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-[#0B3B17]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              AUTHENTICATING...
            </span>
          ) : (
            "SIGN IN TO PORTAL"
          )}
        </button>
      </form>

      {/* Back to Customer Login Link */}
      <div className="mt-6 pt-4 border-t border-white/10 text-center relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-200/80 hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#36D068]" />
          <span>Switch to Customer Login</span>
        </Link>
      </div>
    </div>
  );
}

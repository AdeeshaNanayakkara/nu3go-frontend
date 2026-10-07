"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import {
  Menu,
  Bell,
  ChevronRight,
  ShieldCheck,
  Compass,
} from "lucide-react";

interface UserTopbarProps {
  onMobileMenuToggle: () => void;
  activePlanName?: string | null;
}

export function UserTopbar({ onMobileMenuToggle, activePlanName }: UserTopbarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const getPageInfo = () => {
    if (pathname === "/dashboard") return { title: "Dashboard Overview", section: "Home" };
    if (pathname.startsWith("/orders")) return { title: "My Subscriptions", section: "Plans" };
    if (pathname.startsWith("/payments")) return { title: "Billing & Invoices", section: "Finance" };
    if (pathname.startsWith("/settings")) return { title: "Delivery Addresses", section: "Settings" };
    if (pathname.startsWith("/profile")) return { title: "Profile & Account", section: "Account" };
    if (pathname.startsWith("/notifications")) return { title: "Notifications", section: "Alerts" };
    return { title: "Customer Area", section: "Portal" };
  };

  const pageInfo = getPageInfo();
  const displayName = user?.email ? user.email.split("@")[0] : "Customer";

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between transition-all shadow-2xs font-poppins">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline-block">Portal</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline-block" />
          <h1 className="text-sm sm:text-base font-oswald font-bold text-neutral-900 uppercase tracking-tight">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Active Plan Badge, Notification, Quick Link */}
      <div className="flex items-center gap-3">
        {/* Active Plan Pill */}
        {activePlanName ? (
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] font-oswald text-xs font-bold uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#36D068] animate-pulse" />
            <span>{activePlanName}</span>
          </div>
        ) : (
          <Link
            href="/plans"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 hover:text-slate-900 font-oswald text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-[#36D068]" />
            <span>Explore Plans</span>
          </Link>
        )}

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#36D068]" />
        </Link>

        {/* User Mini Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#36D068] to-emerald-400 flex items-center justify-center text-slate-950 font-oswald font-bold text-xs shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
}

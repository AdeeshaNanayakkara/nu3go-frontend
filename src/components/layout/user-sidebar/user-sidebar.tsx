"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  MapPin,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  Compass,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface UserSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function UserSidebar({ isMobileOpen, setIsMobileOpen }: UserSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      window.location.replace("/");
    } catch (err) {
      console.error("[UserSidebar] Logout error:", err);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Subscriptions", href: "/orders", icon: UtensilsCrossed },
    { label: "Billing & Invoices", href: "/payments", icon: Receipt },
    { label: "Delivery Addresses", href: "/settings", icon: MapPin },
    { label: "Profile & Account", href: "/profile", icon: User },
  ];

  const displayName = user?.email
    ? user.email.split("@")[0]
    : "Customer";

  const renderSidebarContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 text-neutral-900 select-none shadow-xs font-poppins">
      {/* Brand Header */}
      <div
        className={`p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between shrink-0 ${
          collapsed ? "px-2 justify-center" : "px-5"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-3 overflow-hidden group hover:opacity-90 transition-opacity"
          title="Nu3Go - Back to Home"
        >
          {collapsed ? (
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0 group-hover:border-[#36D068]/50 transition-colors">
              <Image
                src="/images/nu3go_logo.png"
                alt="Nu3Go"
                width={36}
                height={36}
                className="h-6 w-auto object-contain"
                priority
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <Image
                src="/images/nu3go_logo.png"
                alt="Nu3Go Logo"
                width={130}
                height={40}
                className="h-8 w-auto object-contain group-hover:scale-[1.02] transition-transform origin-left"
                priority
              />
              <span className="font-oswald text-[9px] font-bold uppercase tracking-widest text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-1 w-fit">
                Customer Portal
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer shrink-0 ml-1"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5 custom-scrollbar">
        {!collapsed && (
          <p className="px-3 text-[11px] font-oswald font-bold text-slate-400 uppercase tracking-wider mb-2">
            Menu
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? "bg-[#36D068] text-slate-950 font-bold shadow-md shadow-[#36D068]/20"
                  : "text-slate-600 hover:text-neutral-900 hover:bg-slate-100/80"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-slate-950" : "text-slate-400 group-hover:text-[#36D068]"
                }`}
              />
              {!collapsed && <span className="truncate font-semibold">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-950" />
              )}
            </Link>
          );
        })}

        {/* Explore Plans Quick Card / CTA */}
        {!collapsed ? (
          <div className="pt-6">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white border border-emerald-200/80 relative overflow-hidden group shadow-2xs">
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#36D068]/15 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-[#15803D] font-oswald font-bold text-xs uppercase tracking-wider mb-1.5">
                <Compass className="w-4 h-4 text-[#36D068]" />
                <span>Nutrition Plans</span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Explore high-protein, athletic and classic daily meal plans.
              </p>
              <Link
                href="/plans"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-[#36D068] hover:bg-[#2eb85c] text-black font-oswald font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#36D068]/20 active:scale-95"
              >
                <span>View All Plans</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="pt-4 flex justify-center">
            <Link
              href="/plans"
              title="Explore Plans"
              className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#36D068] hover:bg-[#36D068] hover:text-black transition-all"
            >
              <Compass className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>

      {/* Footer / User Profile & Actions */}
      <div className="p-4 border-t border-slate-200/80 space-y-2 shrink-0 bg-slate-50/70">
        {/* Back to Website */}
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-neutral-900 hover:bg-slate-200/60 transition-all ${
            collapsed ? "justify-center px-0" : ""
          }`}
          title={collapsed ? "Go to Nu3Go Home" : undefined}
        >
          <Home className="w-4 h-4 shrink-0 text-slate-400" />
          {!collapsed && <span>Back to Home</span>}
        </Link>

        {/* User Card */}
        <div
          className={`flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs ${
            collapsed ? "justify-center p-2" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#36D068] to-emerald-400 flex items-center justify-center text-slate-950 font-oswald font-bold text-sm shrink-0 shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate leading-tight capitalize">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500 truncate leading-tight">
                {user?.email || "customer@nu3go.com"}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center justify-center w-full p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          {renderSidebarContent(false)}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-neutral-900 rounded-lg bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 font-poppins">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-oswald font-bold uppercase text-neutral-900">Sign Out of Nu3Go?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You will need to sign back in to manage your active meal subscriptions and deliveries.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-oswald text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

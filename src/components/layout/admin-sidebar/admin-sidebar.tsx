"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Responsive state
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile drawer open

  // Logout modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      window.location.replace("/");
    } catch (err) {
      console.error("[AdminSidebar] Logout error:", err);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Customers", href: "/admin/users", icon: Users },
    { label: "Packages", href: "/admin/packages", icon: Package },
  ];

  const isSettingsActive = pathname.startsWith("/admin/settings");

  const displayName = user?.email
    ? user.email.split("@")[0]
    : "Admin";

  const renderSidebarContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`p-4 border-b border-slate-100 flex items-center justify-between shrink-0 ${collapsed ? "px-3 justify-center" : "px-5"
          }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-[#36D068]/10 p-2 rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#36D068]" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-base text-slate-900 block leading-tight truncate">
                Nu3go Admin
              </span>
              <span className="text-[11px] text-slate-500 font-medium truncate block">
                Management Portal
              </span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${collapsed ? "justify-center px-0" : ""
                } ${isActive
                  ? "bg-[#36D068] text-white shadow-md shadow-[#36D068]/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Settings, User Profile & Logout */}
      <div className="p-3 border-t border-slate-100 space-y-2.5 shrink-0 bg-slate-50/50">
        {/* Settings Link */}
        <Link
          href="/admin/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${collapsed ? "justify-center px-0" : ""
            } ${isSettingsActive
              ? "bg-[#36D068] text-white shadow-md shadow-[#36D068]/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 bg-white border border-slate-200/60"
            }`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </Link>

        {/* User Card + Sign Out Button */}
        <div
          className={`bg-white border border-slate-200/60 p-2 rounded-2xl flex items-center shadow-xs ${collapsed ? "justify-center flex-col gap-2" : "justify-between gap-2"
            }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#36D068] text-white font-bold flex items-center justify-center text-xs shrink-0">
              {displayName[0]?.toUpperCase() || "A"}
            </div>
            {!collapsed && (
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate capitalize leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight">
                  {user?.email || "admin@nu3go.com"}
                </p>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shrink-0 cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── MOBILE TOP BAR (visible on screens < lg) ─── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="bg-[#36D068]/10 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-[#36D068]" />
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">
              Nu3go Admin
            </span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#36D068] text-white font-bold flex items-center justify-center text-xs">
          {displayName[0]?.toUpperCase() || "A"}
        </div>
      </div>

      {/* ─── DESKTOP SIDEBAR (visible on screens >= lg) ─── */}
      <aside
        className={`hidden lg:flex flex-col h-screen font-poppins bg-white border-r border-slate-200/80 shadow-sm shrink-0 sticky top-0 transition-all duration-300 relative group/sidebar ${isCollapsed ? "w-20" : "w-64"
          }`}
      >
        {renderSidebarContent(isCollapsed)}

        {/* Floating Outer Edge Expand/Collapse Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-7 z-40 bg-white border border-slate-200/90 shadow-md hover:shadow-lg text-slate-600 hover:text-slate-900 rounded-full p-1 transition-all cursor-pointer items-center justify-center hover:bg-slate-50 hover:scale-110"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#36D068]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </aside>

      {/* ─── MOBILE DRAWER (overlay for mobile screens) ─── */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}

      {/* ─── LOGOUT CONFIRMATION MODAL ─── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Sign Out</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to sign out of the Nu3go Admin Portal?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <span>Sign Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

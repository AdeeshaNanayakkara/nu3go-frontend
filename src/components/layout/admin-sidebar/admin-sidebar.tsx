"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarX,
  BarChart3,
  Layers,
  PieChart,
  Trophy,
  Truck,
  CalendarClock,
  TrendingUp,
  UtensilsCrossed,
  CircleDollarSign,
  Tag,
  CreditCard,
  Grid,
} from "lucide-react";

const customerSubItems = [
  {
    label: "Overview",
    href: "/admin/users?view=overview",
    description: "Analytics summary & KPI cards",
    icon: PieChart,
  },
  {
    label: "Engagement",
    href: "/admin/users?view=engagement",
    description: "Engagement details & metrics",
    icon: BarChart3,
  },
  {
    label: "Subscriptions",
    href: "/admin/users?view=subscriptions",
    description: "Active subscribers & directory",
    icon: Layers,
  },
  {
    label: "Leaderboard",
    href: "/admin/users?view=leaderboard",
    description: "Top customers by revenue & orders",
    icon: Trophy,
  },
];

const deliverySubItems = [
  {
    label: "Overview",
    href: "/admin/deliveries?view=overview",
    description: "Delivery analytics summary & KPIs",
    icon: PieChart,
  },
  {
    label: "Forecast",
    href: "/admin/deliveries?view=forecast",
    description: "Upcoming demand & kitchen preparation",
    icon: CalendarClock,
  },
  {
    label: "Trend",
    href: "/admin/deliveries?view=trend",
    description: "Delivery fulfillment volume over time",
    icon: TrendingUp,
  },
  {
    label: "Breakdown",
    href: "/admin/deliveries?view=breakdown",
    description: "Volume by plan type, package & weekday",
    icon: Layers,
  },
  {
    label: "Optional Meals",
    href: "/admin/deliveries?view=optional-meals",
    description: "Meal swap popularity & customer preferences",
    icon: UtensilsCrossed,
  },
  {
    label: "Deliveries",
    href: "/admin/deliveries?view=deliveries",
    description: "Daily delivery schedule & fulfillment",
    icon: Truck,
  },
];

const salesSubItems = [
  {
    label: "Overview",
    href: "/admin/sales?view=overview",
    description: "Revenue KPIs & sales summary",
    icon: PieChart,
  },
  {
    label: "Revenue",
    href: "/admin/sales?view=revenue",
    description: "Revenue time series & renewal splits",
    icon: TrendingUp,
  },
  {
    label: "Breakdown",
    href: "/admin/sales?view=breakdown",
    description: "Revenue split by package & plan type",
    icon: Layers,
  },
  {
    label: "Discounts",
    href: "/admin/sales?view=discounts",
    description: "Coupon redemptions & campaign ROI",
    icon: Tag,
  },
  {
    label: "Payments",
    href: "/admin/sales?view=payments",
    description: "Payment health & recurring failures",
    icon: CreditCard,
  },
  {
    label: "Cohorts",
    href: "/admin/sales?view=cohorts",
    description: "Revenue retention & cohort matrix",
    icon: Grid,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams?.get("view") || "overview";
  const { user, logout } = useAuthStore();

  // Responsive state
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile drawer open

  // Customer item accordion state (visible ONLY when clicked)
  const [isCustomerOpen, setIsCustomerOpen] = useState(() => pathname.startsWith("/admin/users"));
  // Delivery item accordion state (visible ONLY when clicked)
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(() => pathname.startsWith("/admin/deliveries"));
  // Sales item accordion state (visible ONLY when clicked)
  const [isSalesOpen, setIsSalesOpen] = useState(() => pathname.startsWith("/admin/sales"));

  // Logout modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sync drawer & accordions on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileOpen(false);
      if (pathname.startsWith("/admin/users")) {
        setIsCustomerOpen(true);
      }
      if (pathname.startsWith("/admin/deliveries")) {
        setIsDeliveryOpen(true);
      }
      if (pathname.startsWith("/admin/sales")) {
        setIsSalesOpen(true);
      }
    }, 0);
    return () => clearTimeout(timer);
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
    { label: "Deliveries", href: "/admin/deliveries", icon: Truck },
    { label: "Sales", href: "/admin/sales", icon: CircleDollarSign },
    { label: "Packages", href: "/admin/packages", icon: Package },
    { label: "Cancellations", href: "/admin/cancellations", icon: CalendarX },
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
      <nav className="flex-1 p-3 space-y-1.5 overflow-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isCustomer = item.label === "Customers";
          const isDelivery = item.label === "Deliveries";
          const isSales = item.label === "Sales";
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          if (isCustomer) {
            return (
              <div key={item.href} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (collapsed) {
                      setIsCollapsed(false);
                    }
                    setIsCustomerOpen((prev) => !prev);
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                    collapsed ? "justify-center px-0" : ""
                  } ${
                    isActive
                      ? "bg-[#36D068] text-white shadow-md shadow-[#36D068]/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isCustomerOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Sub-attributes under Customers: ONLY visible when clicked */}
                {isCustomerOpen && !collapsed && (
                  <div className="ml-7 pl-2.5 border-l-2 border-slate-100 space-y-1 mt-1.5 animate-in slide-in-from-top-1 fade-in duration-150">
                    {customerSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive =
                        pathname === "/admin/users" &&
                        (sub.href.includes(`view=${currentView}`) ||
                          (!searchParams?.get("view") && sub.href.includes("view=overview")));

                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isSubActive
                              ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <SubIcon
                              className={`w-3.5 h-3.5 ${
                                isSubActive ? "text-emerald-700" : "text-slate-400"
                              }`}
                            />
                            <span>{sub.label}</span>
                          </div>
                          {isSubActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#36D068]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (isDelivery) {
            return (
              <div key={item.href} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (collapsed) {
                      setIsCollapsed(false);
                    }
                    setIsDeliveryOpen((prev) => !prev);
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                    collapsed ? "justify-center px-0" : ""
                  } ${
                    isActive
                      ? "bg-[#36D068] text-white shadow-md shadow-[#36D068]/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isDeliveryOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Sub-attributes under Deliveries: ONLY visible when clicked */}
                {isDeliveryOpen && !collapsed && (
                  <div className="ml-7 pl-2.5 border-l-2 border-slate-100 space-y-1 mt-1.5 animate-in slide-in-from-top-1 fade-in duration-150">
                    {deliverySubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const deliveryCurrentView = searchParams?.get("view") || "overview";
                      const isSubActive =
                        pathname === "/admin/deliveries" &&
                        (sub.href.includes(`view=${deliveryCurrentView}`) ||
                          (!searchParams?.get("view") && sub.href.includes("view=overview")));

                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isSubActive
                              ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <SubIcon
                              className={`w-3.5 h-3.5 ${
                                isSubActive ? "text-emerald-700" : "text-slate-400"
                              }`}
                            />
                            <span>{sub.label}</span>
                          </div>
                          {isSubActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#36D068]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (isSales) {
            return (
              <div key={item.href} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (collapsed) {
                      setIsCollapsed(false);
                    }
                    setIsSalesOpen((prev) => !prev);
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                    collapsed ? "justify-center px-0" : ""
                  } ${
                    isActive
                      ? "bg-[#36D068] text-white shadow-md shadow-[#36D068]/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isSalesOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Sub-attributes under Sales: ONLY visible when clicked */}
                {isSalesOpen && !collapsed && (
                  <div className="ml-7 pl-2.5 border-l-2 border-slate-100 space-y-1 mt-1.5 animate-in slide-in-from-top-1 fade-in duration-150">
                    {salesSubItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const salesCurrentView = searchParams?.get("view") || "overview";
                      const isSubActive =
                        pathname === "/admin/sales" &&
                        (sub.href.includes(`view=${salesCurrentView}`) ||
                          (!searchParams?.get("view") && sub.href.includes("view=overview")));

                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isSubActive
                              ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <SubIcon
                              className={`w-3.5 h-3.5 ${
                                isSubActive ? "text-emerald-700" : "text-slate-400"
                              }`}
                            />
                            <span>{sub.label}</span>
                          </div>
                          {isSubActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#36D068]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

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
        className={`hidden lg:flex flex-col h-screen font-poppins bg-white border-r border-slate-200/80 shadow-sm shrink-0 sticky top-0 transition-all duration-300 relative z-30 group/sidebar ${isCollapsed ? "w-20" : "w-64"
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

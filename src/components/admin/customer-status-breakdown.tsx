"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  UserCheck,
  AlertCircle,
  Clock,
  UserX,
  History,
  ShieldAlert,
  RefreshCw,
  PieChart,
  Layers,
  ArrowRight,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  analyticsService,
  type CustomerStatusBreakdownRes,
  type CustomerStatusSegment,
} from "@/services/api/analytics.service";

interface CustomerStatusBreakdownProps {
  onSelectSegment?: (segmentKey: string | null) => void;
  selectedSegment?: string | null;
}

interface SegmentConfig {
  label: string;
  badge: string;
  description: string;
  precedence: number;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  iconBg: string;
  iconColor: string;
  barColor: string;
  icon: typeof UserCheck;
}

const SEGMENT_CONFIGS: Record<string, SegmentConfig> = {
  active: {
    label: "Active Subscribers",
    badge: "Subscribed",
    description: "Currently subscribed with an active delivery meal plan",
    precedence: 1,
    bgGradient: "from-emerald-50/90 to-emerald-100/40",
    borderColor: "border-emerald-200/90",
    textColor: "text-emerald-950",
    iconBg: "bg-[#36D068]/15 text-[#15803D]",
    iconColor: "text-[#15803D]",
    barColor: "bg-[#36D068]",
    icon: UserCheck,
  },
  payment_failed: {
    label: "Payment Failed",
    badge: "Action Required",
    description: "Subscription renewal or checkout payment failed",
    precedence: 2,
    bgGradient: "from-rose-50/90 to-rose-100/40",
    borderColor: "border-rose-200/90",
    textColor: "text-rose-950",
    iconBg: "bg-rose-100 text-rose-700",
    iconColor: "text-rose-600",
    barColor: "bg-rose-500",
    icon: CreditCard,
  },
  pending: {
    label: "Pending Activation",
    badge: "Pending",
    description: "Subscription created, awaiting payment clearance or start date",
    precedence: 3,
    bgGradient: "from-amber-50/90 to-amber-100/40",
    borderColor: "border-amber-200/90",
    textColor: "text-amber-950",
    iconBg: "bg-amber-100 text-amber-700",
    iconColor: "text-amber-600",
    barColor: "bg-amber-500",
    icon: Clock,
  },
  lapsed: {
    label: "Lapsed / Churned",
    badge: "Inactive Sub",
    description: "Former subscriber whose plan expired without renewal",
    precedence: 4,
    bgGradient: "from-purple-50/90 to-purple-100/40",
    borderColor: "border-purple-200/90",
    textColor: "text-purple-950",
    iconBg: "bg-purple-100 text-purple-700",
    iconColor: "text-purple-600",
    barColor: "bg-purple-500",
    icon: History,
  },
  never_subscribed: {
    label: "Never Subscribed",
    badge: "Prospect",
    description: "Registered account that has not yet purchased a plan",
    precedence: 5,
    bgGradient: "from-sky-50/90 to-sky-100/40",
    borderColor: "border-sky-200/90",
    textColor: "text-sky-950",
    iconBg: "bg-sky-100 text-sky-700",
    iconColor: "text-sky-600",
    barColor: "bg-sky-500",
    icon: UserX,
  },
};

const DEFAULT_SEGMENT_CONFIG: SegmentConfig = {
  label: "Other Segment",
  badge: "Customer",
  description: "Customer lifecycle segment",
  precedence: 6,
  bgGradient: "from-slate-50 to-slate-100/50",
  borderColor: "border-slate-200",
  textColor: "text-slate-900",
  iconBg: "bg-slate-100 text-slate-700",
  iconColor: "text-slate-600",
  barColor: "bg-slate-400",
  icon: Users,
};

export function CustomerStatusBreakdown({
  onSelectSegment,
  selectedSegment,
}: CustomerStatusBreakdownProps) {
  const [data, setData] = useState<CustomerStatusBreakdownRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBreakdown = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getCustomerStatusBreakdown();
      if (result) {
        setData(result);
      } else {
        // Fallback default structure if backend response is empty
        setData(null);
      }
    } catch (err: unknown) {
      console.warn("[CustomerStatusBreakdown] Error loading breakdown:", err);
      setError("Unable to load customer status breakdown.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBreakdown();
  }, [fetchBreakdown]);

  // Extract segments or standard fallback
  const segments = useMemo(() => {
    if (data?.segments && data.segments.length > 0) {
      // Sort by precedence order
      return [...data.segments].sort((a, b) => {
        const orderA = SEGMENT_CONFIGS[a.key]?.precedence ?? 99;
        const orderB = SEGMENT_CONFIGS[b.key]?.precedence ?? 99;
        return orderA - orderB;
      });
    }

    // Default placeholder segments when API returns 0 rows or is empty
    return [
      { key: "active", count: 0, pct: 0 },
      { key: "payment_failed", count: 0, pct: 0 },
      { key: "pending", count: 0, pct: 0 },
      { key: "lapsed", count: 0, pct: 0 },
      { key: "never_subscribed", count: 0, pct: 0 },
    ] as CustomerStatusSegment[];
  }, [data]);

  const totalCustomers = data?.total ?? segments.reduce((sum, s) => sum + s.count, 0);
  const inactiveAccounts = data?.inactive_accounts ?? 0;

  // Find active segment stats
  const activeSegment = segments.find((s) => s.key === "active");
  const paymentFailedSegment = segments.find((s) => s.key === "payment_failed");

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 font-poppins">
      {/* ─── Header & Meta ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#36D068] animate-pulse" />
              Live Subscription Breakdown
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              /api/v1/analytics/customers/status-breakdown
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Subscription Status Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Snapshot grouping each customer into one lifecycle state by precedence:{" "}
            <span className="font-semibold text-slate-700">Active</span> →{" "}
            <span className="font-semibold text-slate-700">Payment Failed</span> →{" "}
            <span className="font-semibold text-slate-700">Pending</span> →{" "}
            <span className="font-semibold text-slate-700">Lapsed</span> →{" "}
            <span className="font-semibold text-slate-700">Never Subscribed</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          {selectedSegment && (
            <button
              type="button"
              onClick={() => onSelectSegment?.(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Reset Filter ({selectedSegment})
            </button>
          )}

          <button
            type="button"
            onClick={fetchBreakdown}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2 text-xs font-semibold border border-slate-200/70"
            title="Refresh status breakdown"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#36D068]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchBreakdown}
            className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg text-xs hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── High-Level Summary Metric Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Customers */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 transition-all hover:shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-oswald">
              Total Customers
            </span>
            <div className="p-2 rounded-xl bg-slate-200/70 text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isLoading ? "..." : totalCustomers.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">registered</span>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 border border-emerald-200/80 rounded-2xl p-4 transition-all hover:shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-oswald">
              Active Subscribers
            </span>
            <div className="p-2 rounded-xl bg-[#36D068]/20 text-[#15803D]">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
              {isLoading ? "..." : (activeSegment?.count ?? 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#15803D] bg-emerald-100/90 px-1.5 py-0.5 rounded-md">
              {isLoading ? "" : `${activeSegment?.pct ?? 0}%`}
            </span>
          </div>
        </div>

        {/* Payment Failed / Issues */}
        <div className="bg-gradient-to-br from-rose-50/90 to-rose-100/40 border border-rose-200/80 rounded-2xl p-4 transition-all hover:shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 font-oswald">
              Payment Issues
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-950">
              {isLoading ? "..." : (paymentFailedSegment?.count ?? 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-100/90 px-1.5 py-0.5 rounded-md">
              {isLoading ? "" : `${paymentFailedSegment?.pct ?? 0}%`}
            </span>
          </div>
        </div>

        {/* Inactive Accounts */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 transition-all hover:shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-oswald">
              Inactive Accounts
            </span>
            <div className="p-2 rounded-xl bg-slate-200/70 text-slate-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isLoading ? "..." : inactiveAccounts.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">suspended</span>
          </div>
        </div>
      </div>

      {/* ─── Multi-Segment Proportional Progress Bar ─── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <PieChart className="w-3.5 h-3.5 text-[#36D068]" />
            Lifecycle Distribution (100% of Tracked Customers)
          </span>
          <span className="text-slate-400 text-[11px]">Sorted by business precedence</span>
        </div>

        {/* Progress Bar Track */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/60 p-0.5 gap-0.5">
          {segments.map((seg) => {
            const cfg = SEGMENT_CONFIGS[seg.key] || DEFAULT_SEGMENT_CONFIG;
            const pctVal = seg.pct > 0 ? seg.pct : seg.count > 0 && totalCustomers > 0 ? (seg.count / totalCustomers) * 100 : 0;
            if (pctVal <= 0) return null;

            return (
              <div
                key={seg.key}
                style={{ width: `${Math.max(pctVal, 2)}%` }}
                className={`${cfg.barColor} h-full rounded-full transition-all duration-500 hover:opacity-90 relative group/bar cursor-pointer`}
                title={`${cfg.label}: ${seg.count} (${seg.pct}%)`}
                onClick={() => onSelectSegment?.(seg.key)}
              />
            );
          })}
        </div>

        {/* Quick Legend under Bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
          {segments.map((seg) => {
            const cfg = SEGMENT_CONFIGS[seg.key] || DEFAULT_SEGMENT_CONFIG;
            const isSelected = selectedSegment === seg.key;
            return (
              <button
                key={seg.key}
                type="button"
                onClick={() => onSelectSegment?.(isSelected ? null : seg.key)}
                className={`inline-flex items-center gap-1.5 text-[11px] transition-all cursor-pointer ${
                  isSelected ? "font-bold text-slate-900 underline underline-offset-4" : "hover:text-slate-900"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.barColor}`} />
                <span>
                  {cfg.label}: <strong>{seg.count}</strong> ({seg.pct}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Detailed Lifecycle Segment Cards Grid ─── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-oswald flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#36D068]" />
            Precedence Status Segments
          </h3>
          <span className="text-xs text-slate-400">
            Click a card to filter user directory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {segments.map((seg) => {
            const cfg = SEGMENT_CONFIGS[seg.key] || DEFAULT_SEGMENT_CONFIG;
            const Icon = cfg.icon;
            const isSelected = selectedSegment === seg.key;

            return (
              <div
                key={seg.key}
                onClick={() => onSelectSegment?.(isSelected ? null : seg.key)}
                className={`rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between text-left relative overflow-hidden group hover:scale-[1.01] hover:shadow-md ${
                  cfg.bgGradient
                } ${cfg.borderColor} ${
                  isSelected
                    ? "ring-2 ring-[#36D068] shadow-md border-[#36D068]"
                    : "hover:border-slate-300"
                }`}
              >
                {/* Precedence Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono bg-white/80 border border-slate-200/60 px-2 py-0.5 rounded-md">
                    Priority #{cfg.precedence}
                  </span>
                  <div className={`p-2 rounded-xl transition-colors ${cfg.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Metric count and percentage */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {isLoading ? "..." : seg.count.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-white/90 border border-slate-200/60 text-slate-800 shadow-2xs">
                      {isLoading ? "" : `${seg.pct}%`}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 font-oswald uppercase tracking-wide">
                    {cfg.label}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                    {cfg.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {cfg.badge}
                  </span>
                  <span className="text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold">
                    Filter <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

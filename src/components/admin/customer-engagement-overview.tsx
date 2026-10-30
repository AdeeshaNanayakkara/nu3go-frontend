"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  UserCheck,
  RefreshCw,
  Repeat,
  Sparkles,
  CalendarX,
  CreditCard,
  DollarSign,
  TrendingUp,
  Layers,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  PieChart,
  BarChart3,
  Percent,
} from "lucide-react";
import {
  analyticsService,
  type CustomerEngagementRes,
} from "@/services/api/analytics.service";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type DatePreset = "30d" | "7d" | "90d" | "month" | "custom";

interface CustomerEngagementOverviewProps {
  totalRegisteredUsers?: number;
}

export function CustomerEngagementOverview({
  totalRegisteredUsers,
}: CustomerEngagementOverviewProps) {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  // Active sub-tab toggle ("active_subscriptions" | "meal_cancellations" | "optional_meals")
  const [activeTab, setActiveTab] = useState<"subscriptions" | "cancellations" | "optional">(
    "subscriptions"
  );

  const [data, setData] = useState<CustomerEngagementRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Preset button handler
  const handleApplyPreset = (p: DatePreset) => {
    setPreset(p);
    const now = new Date();
    const endStr = formatYMD(now);
    setToDate(endStr);

    if (p === "7d") {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      setFromDate(formatYMD(start));
    } else if (p === "30d") {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      setFromDate(formatYMD(start));
    } else if (p === "90d") {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      setFromDate(formatYMD(start));
    } else if (p === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setFromDate(formatYMD(start));
    }
  };

  const fetchEngagement = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getCustomerEngagement({
        from: fromDate,
        to: toDate,
      });
      if (result) {
        setData(result);
      } else {
        // Fallback placeholder when backend has no entries yet
        setData(null);
      }
    } catch (err: any) {
      console.warn("[CustomerEngagementOverview] Error fetching engagement:", err);
      setError("Unable to load customer engagement data.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchEngagement();
  }, [fetchEngagement]);

  // Aggregate metrics
  const activeCustomers = data?.active_customers ?? 0;
  const autoRenewPct = data?.auto_renew_pct ?? 0;
  const currency = data?.currency || "LKR";

  const totalActiveSubs = useMemo(() => {
    if (!data?.by_plan_type) return 0;
    return data.by_plan_type.reduce((acc, item) => acc + (item.active_subscriptions || 0), 0);
  }, [data]);

  const mealCancellations = data?.meal_cancellations;
  const optionalMeals = data?.optional_meal_requests;

  // Refund tier total count
  const refundTiers = mealCancellations?.by_refund_tier;
  const fullRefundCount = refundTiers?.FULL ?? 0;
  const halfRefundCount = refundTiers?.HALF ?? 0;
  const noRefundCount = refundTiers?.NONE ?? 0;
  const totalTierCancellations = fullRefundCount + halfRefundCount + noRefundCount || (mealCancellations?.total ?? 0);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 font-poppins">
      {/* ─── Header & Date Filter Bar ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#36D068] animate-pulse" />
              Live Engagement Analytics
            </span>
            <span className="text-xs text-slate-400 font-mono">
              /api/v1/analytics/customers/engagement
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Customer Details &amp; Engagement Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time subscriber activity, renewal retention rates, plan distributions, and cancellation patterns.
          </p>
        </div>

        {/* Date Range Controls & Presets */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          {/* Presets */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {(
              [
                { label: "7D", val: "7d" },
                { label: "30D", val: "30d" },
                { label: "90D", val: "90d" },
                { label: "This Month", val: "month" },
                { label: "Custom", val: "custom" },
              ] as const
            ).map((p) => {
              const isSelected = preset === p.val;
              return (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => handleApplyPreset(p.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Pickers (if custom selected) */}
          {preset === "custom" && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-2xl text-xs">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-hidden"
              />
              <span className="text-slate-400 font-bold">→</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-hidden"
              />
            </div>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchEngagement}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh engagement metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Date Window Indicator */}
      {(data?.from || fromDate) && (
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50/80 border border-slate-200/70 px-3.5 py-2 rounded-2xl">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Metrics window:{" "}
              <strong className="text-slate-800 font-semibold font-mono">
                {data?.from || fromDate}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-800 font-semibold font-mono">
                {data?.to || toDate}
              </strong>
            </span>
          </div>
          {isLoading && (
            <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
              <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
            </span>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchEngagement}
            className="font-bold underline hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── 1. SMALL CARDS ROW (Active Customers, Auto-Renew %, etc.) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Customers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Customers
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="font-oswald text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
              {isLoading ? "..." : activeCustomers.toLocaleString()}
            </span>
            <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Subscribed &amp; Ongoing Plans
            </p>
          </div>
        </div>

        {/* Card 2: Auto-Renew Percentage */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-500">
              Auto-Renew Rate
            </span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-100 group-hover:scale-105 transition-transform">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="font-oswald text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
              {isLoading ? "..." : `${autoRenewPct.toFixed(1)}%`}
            </span>
            <p className="text-[11px] text-cyan-700 font-medium truncate">
              Continuous recurring renewal
            </p>
          </div>
        </div>

        {/* Card 3: Optional Meal Adoption */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-500">
              Optional Meal Adoption
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="font-oswald text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
              {isLoading ? "..." : `${(optionalMeals?.adoption_pct ?? 0).toFixed(1)}%`}
            </span>
            <p className="text-[11px] text-purple-700 font-medium truncate">
              {optionalMeals?.total ?? 0} requests by {optionalMeals?.unique_customers ?? 0} users
            </p>
          </div>
        </div>

        {/* Card 4: Cancellations Ratio / Active Customer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-500">
              Cancellations / User
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 group-hover:scale-105 transition-transform">
              <CalendarX className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="font-oswald text-3xl sm:text-4xl font-black text-slate-900 tracking-tight block">
              {isLoading ? "..." : `${mealCancellations?.per_active_customer ?? 0}`}
            </span>
            <p className="text-[11px] text-amber-700 font-medium truncate">
              {mealCancellations?.total ?? 0} total cancelled meals
            </p>
          </div>
        </div>
      </div>

      {/* ─── 2. TABS SWITCHER (Active Subscriptions vs Meal Cancellations) ─── */}
      <div className="space-y-4">
        {/* Toggle Pills Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("subscriptions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-oswald text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "subscriptions"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Active Subscriptions</span>
              {totalActiveSubs > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                  {totalActiveSubs}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cancellations")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-oswald text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "cancellations"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarX className="w-3.5 h-3.5 text-rose-600" />
              <span>Meal Cancellations</span>
              {(mealCancellations?.total ?? 0) > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800 font-mono">
                  {mealCancellations?.total}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("optional")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-oswald text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "optional"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Optional Meals</span>
              {(optionalMeals?.total ?? 0) > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 font-mono">
                  {optionalMeals?.total}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Toggle views to inspect customer distribution and retention
          </span>
        </div>

        {/* ─── TAB 1: ACTIVE SUBSCRIPTIONS ─── */}
        {activeTab === "subscriptions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* By Plan Type */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-oswald text-sm font-bold uppercase text-slate-900">
                    Breakdown by Plan Type
                  </h4>
                  <p className="text-xs text-slate-500">
                    Active subscriptions categorized by plan structure
                  </p>
                </div>
                <span className="font-oswald text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-xl">
                  {totalActiveSubs} Active
                </span>
              </div>

              {data?.by_plan_type && data.by_plan_type.length > 0 ? (
                <div className="space-y-3">
                  {data.by_plan_type.map((item, idx) => {
                    const count = item.active_subscriptions || 0;
                    const pct = totalActiveSubs > 0 ? Math.round((count / totalActiveSubs) * 100) : 0;
                    const isFixed = item.plan_type?.toUpperCase() === "FIXED";

                    return (
                      <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isFixed ? "bg-[#36D068]" : "bg-blue-500"
                              }`}
                            />
                            <span className="font-oswald font-bold uppercase text-slate-800">
                              {item.plan_type} PLAN
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{count} subs</span>
                            <span className="text-slate-400 font-medium">({pct}%)</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFixed ? "bg-[#36D068]" : "bg-blue-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 italic bg-white rounded-xl border border-slate-200/60">
                  No plan type breakdown available for this date window.
                </div>
              )}
            </div>

            {/* By Billing Cycle */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-oswald text-sm font-bold uppercase text-slate-900">
                    Breakdown by Billing Cycle
                  </h4>
                  <p className="text-xs text-slate-500">
                    Cycle duration frequency chosen by active subscribers
                  </p>
                </div>
                <span className="font-oswald text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-xl">
                  {data?.by_billing_cycle?.length || 0} Cycles
                </span>
              </div>

              {data?.by_billing_cycle && data.by_billing_cycle.length > 0 ? (
                <div className="space-y-3">
                  {data.by_billing_cycle.map((item, idx) => {
                    const count = item.active_subscriptions || 0;
                    const pct = totalActiveSubs > 0 ? Math.round((count / totalActiveSubs) * 100) : 0;

                    return (
                      <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                            <span className="font-oswald font-bold uppercase text-slate-800">
                              {item.billing_cycle || "CUSTOM"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{count} subs</span>
                            <span className="text-slate-400 font-medium">({pct}%)</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 italic bg-white rounded-xl border border-slate-200/60">
                  No billing cycle breakdown available for this date window.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 2: MEAL CANCELLATIONS ─── */}
        {activeTab === "cancellations" && (
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-oswald text-sm font-bold uppercase text-slate-900">
                  Meal Cancellations &amp; Refund Analytics
                </h4>
                <p className="text-xs text-slate-500">
                  Track meal skips, unique affected customers, and refund policy tier execution.
                </p>
              </div>

              {mealCancellations?.refund_total !== undefined && (
                <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-1.5 self-start sm:self-center">
                  <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                  <span>
                    Total Refunds:{" "}
                    <strong className="font-bold">
                      {currency} {Number(mealCancellations.refund_total).toLocaleString()}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium block">Total Cancelled</span>
                <span className="font-oswald text-2xl font-bold text-rose-700 block mt-0.5">
                  {mealCancellations?.total ?? 0}
                </span>
                <span className="text-[10px] text-slate-400">Meals skipped</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium block">Unique Customers</span>
                <span className="font-oswald text-2xl font-bold text-slate-800 block mt-0.5">
                  {mealCancellations?.unique_customers ?? 0}
                </span>
                <span className="text-[10px] text-slate-400">Users who cancelled</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium block">Rate Per Active User</span>
                <span className="font-oswald text-2xl font-bold text-amber-700 block mt-0.5">
                  {mealCancellations?.per_active_customer ?? 0}
                </span>
                <span className="text-[10px] text-slate-400">Avg cancels / customer</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-500 font-medium block">Refund Value</span>
                <span className="font-oswald text-xl sm:text-2xl font-bold text-slate-900 block mt-0.5 truncate">
                  {currency} {(mealCancellations?.refund_total ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">Credited to wallets</span>
              </div>
            </div>

            {/* Refund Tiers Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-oswald text-xs font-bold uppercase text-slate-700">
                  Cancellations by Refund Tier Policy
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Cutoff notice rules applied
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* FULL Refund Tier */}
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="flex items-center justify-between">
                    <span className="font-oswald text-xs font-bold uppercase text-emerald-800">
                      FULL (100%)
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      Early Notice
                    </span>
                  </div>
                  <span className="font-oswald text-2xl font-black text-emerald-900 block mt-1">
                    {fullRefundCount}
                  </span>
                  <p className="text-[10px] text-emerald-700/80 mt-0.5">
                    {totalTierCancellations > 0
                      ? `${Math.round((fullRefundCount / totalTierCancellations) * 100)}% of cancellations`
                      : "0%"}
                  </p>
                </div>

                {/* HALF Refund Tier */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <span className="font-oswald text-xs font-bold uppercase text-amber-800">
                      HALF (50%)
                    </span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                      Mid Notice
                    </span>
                  </div>
                  <span className="font-oswald text-2xl font-black text-amber-900 block mt-1">
                    {halfRefundCount}
                  </span>
                  <p className="text-[10px] text-amber-700/80 mt-0.5">
                    {totalTierCancellations > 0
                      ? `${Math.round((halfRefundCount / totalTierCancellations) * 100)}% of cancellations`
                      : "0%"}
                  </p>
                </div>

                {/* NONE Refund Tier */}
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80">
                  <div className="flex items-center justify-between">
                    <span className="font-oswald text-xs font-bold uppercase text-rose-800">
                      NONE (0%)
                    </span>
                    <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold">
                      Late Notice
                    </span>
                  </div>
                  <span className="font-oswald text-2xl font-black text-rose-900 block mt-1">
                    {noRefundCount}
                  </span>
                  <p className="text-[10px] text-rose-700/80 mt-0.5">
                    {totalTierCancellations > 0
                      ? `${Math.round((noRefundCount / totalTierCancellations) * 100)}% of cancellations`
                      : "0%"}
                  </p>
                </div>
              </div>

              {/* Stacked Tier Distribution Bar */}
              {totalTierCancellations > 0 && (
                <div className="pt-2">
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${(fullRefundCount / totalTierCancellations) * 100}%` }}
                      title={`Full: ${fullRefundCount}`}
                    />
                    <div
                      className="bg-amber-400 h-full transition-all duration-500"
                      style={{ width: `${(halfRefundCount / totalTierCancellations) * 100}%` }}
                      title={`Half: ${halfRefundCount}`}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all duration-500"
                      style={{ width: `${(noRefundCount / totalTierCancellations) * 100}%` }}
                      title={`None: ${noRefundCount}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: OPTIONAL MEAL REQUESTS ─── */}
        {activeTab === "optional" && (
          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/70 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-oswald text-sm font-bold uppercase text-purple-950">
                  Optional Alternative Meal Engagement
                </h4>
                <p className="text-xs text-purple-800/80">
                  Customer choices for alternative chef-crafted meals over regular menu items.
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold font-oswald uppercase tracking-wider self-start sm:self-center">
                {(optionalMeals?.adoption_pct ?? 0).toFixed(1)}% Adoption
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl border border-purple-200/80">
                <span className="text-[11px] text-slate-500 font-medium block">Total Alternative Requests</span>
                <span className="font-oswald text-2xl font-bold text-purple-900 block mt-0.5">
                  {optionalMeals?.total ?? 0}
                </span>
                <span className="text-[10px] text-purple-700">Meals swapped for alternative</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-purple-200/80">
                <span className="text-[11px] text-slate-500 font-medium block">Unique Requesters</span>
                <span className="font-oswald text-2xl font-bold text-slate-800 block mt-0.5">
                  {optionalMeals?.unique_customers ?? 0}
                </span>
                <span className="text-[10px] text-slate-400">Subscribers who requested</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-purple-200/80">
                <span className="text-[11px] text-slate-500 font-medium block">Customer Adoption Rate</span>
                <span className="font-oswald text-2xl font-bold text-purple-700 block mt-0.5">
                  {(optionalMeals?.adoption_pct ?? 0).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400">Share of active customer base</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

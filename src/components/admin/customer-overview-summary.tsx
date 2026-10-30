"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  Percent,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Wallet,
  RefreshCw,
  Calendar,
  AlertCircle,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react";
import {
  analyticsService,
  type CustomerSummaryRes,
  type AnalyticsStatCard,
} from "@/services/api/analytics.service";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type DatePreset = "30d" | "7d" | "90d" | "month" | "custom";

interface CustomerOverviewSummaryProps {
  totalRegisteredUsers?: number;
}

export function CustomerOverviewSummary({
  totalRegisteredUsers,
}: CustomerOverviewSummaryProps) {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  const [data, setData] = useState<CustomerSummaryRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Preset handler
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

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getCustomerSummary({
        from: fromDate,
        to: toDate,
      });
      if (result) {
        setData(result);
      } else {
        setData(null);
      }
    } catch (err: unknown) {
      console.warn("[CustomerOverviewSummary] Error loading customer summary:", err);
      setError("Unable to load customer analytics summary.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const currency = data?.currency || "LKR";

  // Stat card config helper
  const renderStatCard = (
    title: string,
    stat: AnalyticsStatCard | undefined,
    icon: any,
    options?: {
      isCurrency?: boolean;
      isPct?: boolean;
      invertTrendGoodness?: boolean; // For churn: down is good, up is bad
      gradientBg?: string;
      borderColor?: string;
      iconBg?: string;
      iconColor?: string;
    }
  ) => {
    const Icon = icon;
    const value = stat?.value ?? 0;
    const prevValue = stat?.previous_value ?? 0;
    const changePct = stat?.change_pct ?? 0;
    const trend = stat?.trend || "flat";

    // Format display string
    let displayVal = value.toLocaleString();
    let displayPrev = prevValue.toLocaleString();

    if (options?.isCurrency) {
      displayVal = `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
      displayPrev = `${currency} ${prevValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    } else if (options?.isPct) {
      displayVal = `${value}%`;
      displayPrev = `${prevValue}%`;
    }

    // Determine trend color
    const isUp = trend === "up";
    const isDown = trend === "down";
    const isPositive = options?.invertTrendGoodness ? isDown : isUp;
    const isNegative = options?.invertTrendGoodness ? isUp : isDown;

    return (
      <div
        className={`rounded-2xl border p-4 sm:p-5 transition-all hover:shadow-md flex flex-col justify-between ${
          options?.gradientBg || "bg-white"
        } ${options?.borderColor || "border-slate-200/80"}`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-oswald">
              {title}
            </span>
            <div
              className={`p-2 rounded-xl transition-colors ${
                options?.iconBg || "bg-slate-100 text-slate-600"
              }`}
            >
              <Icon className={`w-4 h-4 ${options?.iconColor || ""}`} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? "..." : displayVal}
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {!isLoading && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isPositive
                      ? "bg-emerald-100/80 text-emerald-800"
                      : isNegative
                      ? "bg-rose-100/80 text-rose-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isUp && <TrendingUp className="w-3 h-3" />}
                  {isDown && <TrendingDown className="w-3 h-3" />}
                  {trend === "flat" && <Minus className="w-3 h-3" />}
                  {changePct > 0 ? `+${changePct}%` : `${changePct}%`}
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                prev: <strong className="text-slate-600 font-semibold">{isLoading ? "..." : displayPrev}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 font-poppins">
      {/* ─── Header & Date Controls ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#36D068] animate-pulse" />
              Live Customer Analytics
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              /api/v1/analytics/customers/summary
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Customer Analytics Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Key performance indicators for the selected date range, each compared with the previous period of equal length.
          </p>
        </div>

        {/* Date Filter Presets */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
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

          <button
            type="button"
            onClick={fetchSummary}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2 text-xs font-semibold border border-slate-200/70"
            title="Refresh summary metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#36D068]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Comparison Window Banner */}
      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-[#36D068]" />
          <span>
            Current Period:{" "}
            <strong className="text-slate-900 font-mono">
              {data?.range?.from || fromDate}
            </strong>{" "}
            to{" "}
            <strong className="text-slate-900 font-mono">
              {data?.range?.to || toDate}
            </strong>
          </span>
          {data?.range?.previous_from && data?.range?.previous_to && (
            <>
              <span className="text-slate-400 font-bold">vs</span>
              <span>
                Previous Period:{" "}
                <span className="text-slate-600 font-mono">
                  {data.range.previous_from} to {data.range.previous_to}
                </span>
              </span>
            </>
          )}
        </div>
        {isLoading && (
          <span className="text-[#15803D] font-medium text-xs flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin" /> Updating...
          </span>
        )}
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
            onClick={fetchSummary}
            className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg text-xs hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── 8 Key Customer Performance Metrics Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        {renderStatCard(
          "Total Customers",
          data?.total_customers,
          Users,
          {
            gradientBg: "bg-gradient-to-br from-emerald-50/70 to-emerald-100/30",
            borderColor: "border-emerald-200/70",
            iconBg: "bg-[#36D068]/20 text-[#15803D]",
          }
        )}

        {/* New Customers */}
        {renderStatCard(
          "New Customers",
          data?.new_customers,
          UserPlus,
          {
            gradientBg: "bg-gradient-to-br from-sky-50/70 to-sky-100/30",
            borderColor: "border-sky-200/70",
            iconBg: "bg-sky-100 text-sky-700",
          }
        )}

        {/* Active Subscribers */}
        {renderStatCard(
          "Active Subscribers",
          data?.active_subscribers,
          UserCheck,
          {
            gradientBg: "bg-gradient-to-br from-emerald-50/90 to-emerald-100/50",
            borderColor: "border-emerald-200",
            iconBg: "bg-[#36D068]/20 text-[#15803D]",
          }
        )}

        {/* Conversion Rate */}
        {renderStatCard(
          "Conversion Rate",
          data?.conversion_rate_pct,
          Percent,
          {
            isPct: true,
            gradientBg: "bg-gradient-to-br from-amber-50/70 to-amber-100/30",
            borderColor: "border-amber-200/70",
            iconBg: "bg-amber-100 text-amber-700",
          }
        )}

        {/* Churn Rate */}
        {renderStatCard(
          "Churn Rate",
          data?.churn_rate_pct,
          TrendingDown,
          {
            isPct: true,
            invertTrendGoodness: true, // Lower churn is good!
            gradientBg: "bg-gradient-to-br from-rose-50/70 to-rose-100/30",
            borderColor: "border-rose-200/70",
            iconBg: "bg-rose-100 text-rose-700",
          }
        )}

        {/* Churned Customers */}
        {renderStatCard(
          "Churned Customers",
          data?.churned_customers,
          UserMinus,
          {
            invertTrendGoodness: true, // Fewer churned is good!
            gradientBg: "bg-gradient-to-br from-rose-50/50 to-slate-50",
            borderColor: "border-rose-200/60",
            iconBg: "bg-rose-100 text-rose-700",
          }
        )}

        {/* Average Lifetime Value (LTV) */}
        {renderStatCard(
          "Avg Lifetime Value",
          data?.avg_lifetime_value,
          DollarSign,
          {
            isCurrency: true,
            gradientBg: "bg-gradient-to-br from-purple-50/70 to-purple-100/30",
            borderColor: "border-purple-200/70",
            iconBg: "bg-purple-100 text-purple-700",
          }
        )}

        {/* Wallet Liability */}
        {renderStatCard(
          "Wallet Liability",
          data?.wallet_liability,
          Wallet,
          {
            isCurrency: true,
            gradientBg: "bg-gradient-to-br from-slate-50 to-slate-100/60",
            borderColor: "border-slate-200/80",
            iconBg: "bg-slate-200/70 text-slate-700",
          }
        )}
      </div>

      {/* ─── Metric Comparison & Deep-Dive Table ─── */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-oswald flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#36D068]" />
            Period Comparison Breakdown
          </h3>
          <span className="text-xs text-slate-500">
            Current vs. equal-length prior window
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs">
          <table className="w-full text-left text-xs font-poppins">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4">Current Period</th>
                <th className="py-3 px-4">Previous Period</th>
                <th className="py-3 px-4">Change (% Delta)</th>
                <th className="py-3 px-4">Trend Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {[
                { label: "Total Customer Base", stat: data?.total_customers },
                { label: "New Customer Acquisitions", stat: data?.new_customers },
                { label: "Active Recurring Subscribers", stat: data?.active_subscribers },
                { label: "Subscriber Conversion Rate", stat: data?.conversion_rate_pct, isPct: true },
                { label: "Customer Churn Rate", stat: data?.churn_rate_pct, isPct: true, invert: true },
                { label: "Churned Customers Count", stat: data?.churned_customers, invert: true },
                { label: "Average Lifetime Value (LTV)", stat: data?.avg_lifetime_value, isCurrency: true },
                { label: "Customer Wallet Credit Liability", stat: data?.wallet_liability, isCurrency: true },
              ].map((row, idx) => {
                const val = row.stat?.value ?? 0;
                const prev = row.stat?.previous_value ?? 0;
                const change = row.stat?.change_pct ?? 0;
                const trend = row.stat?.trend || "flat";

                const isGood = row.invert ? trend === "down" : trend === "up";
                const isBad = row.invert ? trend === "up" : trend === "down";

                let fmtVal = val.toLocaleString();
                let fmtPrev = prev.toLocaleString();
                if (row.isCurrency) {
                  fmtVal = `${currency} ${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
                  fmtPrev = `${currency} ${prev.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
                } else if (row.isPct) {
                  fmtVal = `${val}%`;
                  fmtPrev = `${prev}%`;
                }

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{row.label}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{isLoading ? "..." : fmtVal}</td>
                    <td className="py-3 px-4 text-slate-500">{isLoading ? "..." : fmtPrev}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          isGood
                            ? "bg-emerald-100/90 text-emerald-800"
                            : isBad
                            ? "bg-rose-100/90 text-rose-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                        {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                        {change > 0 ? `+${change}%` : `${change}%`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium text-slate-600">
                        {trend === "up" ? "Growing" : trend === "down" ? "Declining" : "Stable"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

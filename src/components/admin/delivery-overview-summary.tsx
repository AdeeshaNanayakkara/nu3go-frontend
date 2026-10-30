"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  CheckCircle2,
  AlertCircle,
  Percent,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CalendarX,
  BarChart3,
  Sparkles,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  analyticsService,
  type DeliverySummaryRes,
  type AnalyticsStatCard,
} from "@/services/api/analytics.service";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type DatePreset = "30d" | "7d" | "90d" | "month" | "custom";

interface DeliveryOverviewSummaryProps {
  onSwitchToDeliveriesTab?: () => void;
}

export function DeliveryOverviewSummary({
  onSwitchToDeliveriesTab,
}: DeliveryOverviewSummaryProps) {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  const [data, setData] = useState<DeliverySummaryRes | null>(null);
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
      const result = await analyticsService.getDeliverySummary({
        from: fromDate,
        to: toDate,
      });
      if (result) {
        setData(result);
      } else {
        setData(null);
      }
    } catch (err: unknown) {
      console.warn("[DeliveryOverviewSummary] Error loading delivery summary:", err);
      setError("Unable to load delivery analytics summary.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSummary();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSummary]);

  // Stat card renderer helper
  const renderStatCard = (
    title: string,
    subtitle: string,
    stat: AnalyticsStatCard | undefined,
    Icon: React.ComponentType<{ className?: string }>,
    options?: {
      isPct?: boolean;
      invertTrendGoodness?: boolean; // For missed/cancellations/late: down is good, up is bad
      gradientBg?: string;
      borderColor?: string;
      iconBg?: string;
      iconColor?: string;
    }
  ) => {
    const value = stat?.value ?? 0;
    const prevValue = stat?.previous_value ?? 0;
    const changePct = stat?.change_pct ?? 0;
    const trend = stat?.trend || "flat";

    let displayVal = value.toLocaleString();
    let displayPrev = prevValue.toLocaleString();

    if (options?.isPct) {
      displayVal = `${value}%`;
      displayPrev = `${prevValue}%`;
    }

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
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-oswald block">
                {title}
              </span>
              <span className="text-[10px] text-slate-400 block line-clamp-1">
                {subtitle}
              </span>
            </div>
            <div
              className={`p-2 rounded-xl transition-colors shrink-0 ${
                options?.iconBg || "bg-slate-100 text-slate-600"
              }`}
            >
              <Icon className={`w-4 h-4 ${options?.iconColor || ""}`} />
            </div>
          </div>

          <div className="space-y-1 mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-poppins">
              {isLoading ? "..." : displayVal}
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              {!isLoading && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isPositive
                      ? "bg-emerald-100/90 text-emerald-800"
                      : isNegative
                      ? "bg-rose-100/90 text-rose-800"
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

  const pendingToday = data?.pending_today ?? 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 font-poppins">
      {/* ─── Header & Date Controls ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#36D068] animate-pulse" />
              Live Delivery Analytics
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              /api/v1/analytics/deliveries/summary
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Delivery Operations & KPI Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Key delivery performance indicators for the selected window, each compared with the previous period of equal length.
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-[#36D068] shrink-0" />
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
          <span className="text-[#15803D] font-medium text-xs flex items-center gap-1.5 shrink-0">
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
            className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg text-xs hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Today's Operational Spotlight (pending_today) ─── */}
      <div
        className={`rounded-3xl border p-5 sm:p-6 transition-all ${
          pendingToday > 0
            ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-amber-200 shadow-sm"
            : "bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white border-emerald-200 shadow-sm"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl shrink-0 ${
                pendingToday > 0
                  ? "bg-amber-100 text-amber-700 border border-amber-200/80"
                  : "bg-emerald-100 text-[#15803D] border border-emerald-200/80"
              }`}
            >
              {pendingToday > 0 ? (
                <Clock className="w-6 h-6 animate-pulse" />
              ) : (
                <Check className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-bold font-oswald uppercase px-2.5 py-0.5 rounded-full ${
                    pendingToday > 0
                      ? "bg-amber-200/70 text-amber-900 border border-amber-300"
                      : "bg-emerald-200/70 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {pendingToday > 0 ? "Action Required Today" : "Fulfillment Completed"}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Daily Real-Time Dispatch Monitor
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {pendingToday > 0 ? (
                  <>
                    <strong className="text-amber-800 text-2xl font-extrabold mr-1.5 font-poppins">
                      {pendingToday}
                    </strong>
                    Meal {pendingToday === 1 ? "Delivery" : "Deliveries"} Pending Fulfillment Today
                  </>
                ) : (
                  "All Today's Deliveries Have Been Fulfilled!"
                )}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {pendingToday > 0
                  ? "Open deliveries for today's routes awaiting fulfillment or confirmation. Completed meals are counted once marked delivered."
                  : "No open pending deliveries remaining for today's run. Great job staying on top of dispatch!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {onSwitchToDeliveriesTab ? (
              <button
                type="button"
                onClick={onSwitchToDeliveriesTab}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>View Today&apos;s Deliveries</span>
                <ArrowRight className="w-4 h-4 text-[#36D068]" />
              </button>
            ) : (
              <Link
                href="/admin/deliveries?view=deliveries"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>View Today&apos;s Deliveries</span>
                <ArrowRight className="w-4 h-4 text-[#36D068]" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── 9 Core Delivery Performance Metrics Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Expected Deliveries */}
        {renderStatCard(
          "Expected Deliveries",
          "Scheduled meals minus cancellations",
          data?.expected_deliveries,
          Package,
          {
            gradientBg: "bg-gradient-to-br from-indigo-50/70 to-slate-50",
            borderColor: "border-indigo-200/70",
            iconBg: "bg-indigo-100 text-indigo-700",
          }
        )}

        {/* 2. Delivered */}
        {renderStatCard(
          "Delivered (Fulfilled)",
          "Successfully completed on closed days",
          data?.delivered,
          CheckCircle2,
          {
            gradientBg: "bg-gradient-to-br from-emerald-50/80 to-emerald-100/40",
            borderColor: "border-emerald-200",
            iconBg: "bg-[#36D068]/20 text-[#15803D]",
          }
        )}

        {/* 3. Missed Deliveries */}
        {renderStatCard(
          "Missed Deliveries",
          "Past due without completed status",
          data?.missed,
          AlertCircle,
          {
            invertTrendGoodness: true, // Lower missed is good!
            gradientBg: "bg-gradient-to-br from-rose-50/70 to-rose-100/30",
            borderColor: "border-rose-200/80",
            iconBg: "bg-rose-100 text-rose-700",
          }
        )}

        {/* 4. Completion Rate */}
        {renderStatCard(
          "Completion Rate",
          "Delivered vs expected on closed days",
          data?.completion_rate_pct,
          Percent,
          {
            isPct: true,
            gradientBg: "bg-gradient-to-br from-emerald-50/90 to-sky-50/60",
            borderColor: "border-emerald-200/80",
            iconBg: "bg-emerald-100 text-emerald-800",
          }
        )}

        {/* 5. Cancellation Rate */}
        {renderStatCard(
          "Cancellation Rate",
          "% of scheduled meals cancelled",
          data?.cancellation_rate_pct,
          TrendingDown,
          {
            isPct: true,
            invertTrendGoodness: true, // Lower cancellation rate is good!
            gradientBg: "bg-gradient-to-br from-amber-50/70 to-orange-50/40",
            borderColor: "border-amber-200/70",
            iconBg: "bg-amber-100 text-amber-700",
          }
        )}

        {/* 6. Late-Marked Rate */}
        {renderStatCard(
          "Late-Marked Rate",
          "Marked after scheduled delivery date",
          data?.late_marked_pct,
          Clock,
          {
            isPct: true,
            invertTrendGoodness: true, // Lower late-marked is good!
            gradientBg: "bg-gradient-to-br from-amber-50/60 to-slate-50",
            borderColor: "border-amber-200/60",
            iconBg: "bg-amber-100 text-amber-700",
          }
        )}

        {/* 7. Avg Daily Deliveries */}
        {renderStatCard(
          "Avg Daily Deliveries",
          "Fulfillment volume per active schedule day",
          data?.avg_daily_deliveries,
          BarChart3,
          {
            gradientBg: "bg-gradient-to-br from-sky-50/70 to-blue-50/40",
            borderColor: "border-sky-200/70",
            iconBg: "bg-sky-100 text-sky-700",
          }
        )}

        {/* 8. Meal Cancellations */}
        {renderStatCard(
          "Meal Cancellations",
          "Total meal cancellations in period",
          data?.meal_cancellations,
          CalendarX,
          {
            invertTrendGoodness: true, // Fewer cancellations is good!
            gradientBg: "bg-gradient-to-br from-orange-50/60 to-slate-50",
            borderColor: "border-orange-200/60",
            iconBg: "bg-orange-100 text-orange-700",
          }
        )}

        {/* 9. Optional Meal Swaps */}
        {renderStatCard(
          "Optional Meal Swaps",
          "Custom dishes & optional swap requests",
          data?.optional_swaps,
          Sparkles,
          {
            gradientBg: "bg-gradient-to-br from-purple-50/70 to-purple-100/30",
            borderColor: "border-purple-200/70",
            iconBg: "bg-purple-100 text-purple-700",
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
                <th className="py-3 px-4">Context Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {[
                {
                  label: "Expected Deliveries",
                  stat: data?.expected_deliveries,
                  note: "Total meals scheduled from active subscriptions",
                },
                {
                  label: "Delivered (Fulfilled)",
                  stat: data?.delivered,
                  note: "Closed day meals marked delivered",
                },
                {
                  label: "Missed Deliveries",
                  stat: data?.missed,
                  invert: true,
                  note: "Past due scheduled meals that were unfulfilled",
                },
                {
                  label: "Delivery Completion Rate",
                  stat: data?.completion_rate_pct,
                  isPct: true,
                  note: "Delivered / (Delivered + Missed) on closed days",
                },
                {
                  label: "Meal Cancellation Rate",
                  stat: data?.cancellation_rate_pct,
                  isPct: true,
                  invert: true,
                  note: "Percentage of scheduled meals cancelled by users",
                },
                {
                  label: "Late-Marked Deliveries",
                  stat: data?.late_marked_pct,
                  isPct: true,
                  invert: true,
                  note: "Deliveries confirmed after scheduled date",
                },
                {
                  label: "Average Daily Volume",
                  stat: data?.avg_daily_deliveries,
                  note: "Average expected meals per calendar day",
                },
                {
                  label: "Customer Meal Cancellations",
                  stat: data?.meal_cancellations,
                  invert: true,
                  note: "Total meal cancellations submitted by subscribers",
                },
                {
                  label: "Optional Meal Swaps",
                  stat: data?.optional_swaps,
                  note: "Alternative menu requests requested by subscribers",
                },
              ].map((row, idx) => {
                const val = row.stat?.value ?? 0;
                const prev = row.stat?.previous_value ?? 0;
                const change = row.stat?.change_pct ?? 0;
                const trend = row.stat?.trend || "flat";

                const isGood = row.invert ? trend === "down" : trend === "up";
                const isBad = row.invert ? trend === "up" : trend === "down";

                let fmtVal = val.toLocaleString();
                let fmtPrev = prev.toLocaleString();
                if (row.isPct) {
                  fmtVal = `${val}%`;
                  fmtPrev = `${prev}%`;
                }

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {row.label}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {isLoading ? "..." : fmtVal}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {isLoading ? "..." : fmtPrev}
                    </td>
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
                        {isGood ? "Improving" : isBad ? "Needs Attention" : "Stable"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {row.note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Operational Insights Footer ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-[#15803D] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase font-oswald tracking-wide">
              Fulfillment Health
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Closed days accurately calculate completion and missed meals. Today&apos;s open dispatches are tracked live as pending.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase font-oswald tracking-wide">
              Timely Logging
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Late-marked deliveries reflect updates after the scheduled date. Maintain prompt confirmation for accurate audit trails.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase font-oswald tracking-wide">
              Kitchen Swaps & Churn
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Swaps and cancellations inform meal production forecasting, inventory adjustments, and subscriber preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


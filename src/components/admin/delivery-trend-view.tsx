"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp,
  RefreshCw,
  Calendar,
  ArrowRight,
  Info,
  CalendarRange,
  CheckCircle2,
  AlertTriangle,
  PackageCheck,
  RotateCcw,
} from "lucide-react";
import {
  analyticsService,
  type TrendRes,
  type TrendPointRes,
} from "@/services/api/analytics.service";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(ymd?: string): string {
  if (!ymd) return "—";
  try {
    const parts = ymd.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return ymd;
  } catch {
    return ymd;
  }
}

type DatePreset = "7d" | "30d" | "90d" | "month" | "custom";

interface DeliveryTrendViewProps {
  onSwitchToDeliveriesTab?: () => void;
}

export function DeliveryTrendView({ onSwitchToDeliveriesTab }: DeliveryTrendViewProps) {
  const [preset, setPreset] = useState<DatePreset>("30d");

  // Custom date bounds (default to last 30 days)
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  // Granularity: day | week | month
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");

  // Data states
  const [data, setData] = useState<TrendRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Apply preset calculation
  const applyPreset = (p: DatePreset) => {
    setPreset(p);
    const today = new Date();
    const toStr = formatYMD(today);

    if (p === "7d") {
      const f = new Date();
      f.setDate(f.getDate() - 7);
      setFromDate(formatYMD(f));
      setToDate(toStr);
    } else if (p === "30d") {
      const f = new Date();
      f.setDate(f.getDate() - 30);
      setFromDate(formatYMD(f));
      setToDate(toStr);
    } else if (p === "90d") {
      const f = new Date();
      f.setDate(f.getDate() - 90);
      setFromDate(formatYMD(f));
      setToDate(toStr);
    } else if (p === "month") {
      const f = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(formatYMD(f));
      setToDate(toStr);
    }
  };

  // Main data fetch from /api/v1/analytics/deliveries/trend
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getDeliveryTrend({
        from: fromDate,
        to: toDate,
        granularity,
      });
      setData(result);
    } catch (err: unknown) {
      console.warn("[DeliveryTrendView] Error fetching delivery trend:", err);
      setError("Unable to load delivery trend analytics. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, granularity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Derived metrics
  const points: TrendPointRes[] = useMemo(() => data?.points || [], [data?.points]);

  const totalScheduled = useMemo(
    () => points.reduce((acc, p) => acc + (p.scheduled || 0), 0),
    [points]
  );

  const totalDelivered = useMemo(
    () => points.reduce((acc, p) => acc + (p.delivered || 0), 0),
    [points]
  );

  const totalMissed = useMemo(
    () => points.reduce((acc, p) => acc + (p.missed || 0), 0),
    [points]
  );

  const totalCancelled = useMemo(
    () => points.reduce((acc, p) => acc + (p.cancelled || 0), 0),
    [points]
  );

  const totalSwaps = useMemo(
    () => points.reduce((acc, p) => acc + (p.optional_swaps || 0), 0),
    [points]
  );

  const overallCompletionRate = useMemo(() => {
    if (totalScheduled === 0) return 0;
    return Math.round((totalDelivered / totalScheduled) * 100);
  }, [totalDelivered, totalScheduled]);

  const maxVolume = useMemo(() => {
    if (!points.length) return 1;
    return Math.max(...points.map((p) => Math.max(p.scheduled || 0, p.delivered || 0)), 1);
  }, [points]);

  return (
    <div className="space-y-6">
      {/* ─── Filter & Granularity Banner ─── */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date Window:
            </span>
            {(
              [
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "month", label: "This Month" },
                { id: "custom", label: "Custom" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  preset === p.id
                    ? "bg-[#36D068] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {preset === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#36D068]"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#36D068]"
                />
              </div>
            )}

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold px-2">Granularity:</span>
              {(["day", "week", "month"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGranularity(g)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer ${
                    granularity === g
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 border border-slate-200 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#36D068]" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-[#36D068]" />
            <span>
              Analyzing delivery timeline from{" "}
              <strong className="text-slate-800 font-semibold">
                {formatDateDisplay(data?.from || fromDate)}
              </strong>{" "}
              through{" "}
              <strong className="text-slate-800 font-semibold">
                {formatDateDisplay(data?.to || toDate)}
              </strong>
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Endpoint: <code className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">/api/v1/analytics/deliveries/trend</code>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-sm">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchData}
            className="text-xs font-bold underline hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Scheduled */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Scheduled</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-oswald">
            {isLoading ? "—" : totalScheduled.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total meals queued for delivery</p>
        </div>

        {/* Card 2: Delivered */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-[#36D068]/15 text-[#36D068] flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#36D068] font-oswald">
            {isLoading ? "—" : totalDelivered.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Confirmed received by customers</p>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fulfillment Rate</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 font-oswald">
            {isLoading ? "—" : `${overallCompletionRate}%`}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Delivered vs scheduled ratio</p>
        </div>

        {/* Card 4: Missed */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Missed</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 font-oswald">
            {isLoading ? "—" : totalMissed.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Delivery failed / undelivered</p>
        </div>

        {/* Card 5: Swaps & Cancellations */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Swaps & Cancels</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-oswald">
            {isLoading ? "—" : `${totalSwaps} / ${totalCancelled}`}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Optional swaps vs cancelled</p>
        </div>
      </div>

      {/* ─── Timeline Bar Visual ─── */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#36D068]" />
              <span>Fulfillment Volume Over Time</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled vs Delivered delivery volume visual comparison for each {granularity} bucket.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#36D068]"></span>
              <span>Delivered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-300"></span>
              <span>Scheduled</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#36D068]" />
            <span className="text-sm font-medium">Loading trend buckets...</span>
          </div>
        ) : points.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No delivery trend data available for this range.
          </div>
        ) : (
          <div className="space-y-3.5">
            {points.map((pt, idx) => {
              const delPct = Math.round(((pt.delivered || 0) / maxVolume) * 100);
              const schedPct = Math.round(((pt.scheduled || 0) / maxVolume) * 100);
              const rate = pt.completion_rate_pct != null ? pt.completion_rate_pct : 0;
              const rateBadge =
                rate >= 95
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : rate >= 80
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200";

              return (
                <div
                  key={pt.bucket || idx}
                  className="p-3.5 rounded-2xl hover:bg-slate-50 transition-all border border-slate-100"
                >
                  <div className="flex items-center justify-between gap-3 text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-sm">{pt.bucket}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold border text-[11px] ${rateBadge}`}>
                        {rate.toFixed(0)}% Fulfilled
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 shrink-0">
                      <span>
                        Delivered: <strong className="text-slate-900 font-oswald text-sm">{pt.delivered || 0}</strong>
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>
                        Scheduled: <strong className="text-slate-700">{pt.scheduled || 0}</strong>
                      </span>
                      {pt.missed > 0 && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="text-rose-600 font-medium">
                            Missed: <strong>{pt.missed}</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#36D068] h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.max(delPct, 3)}%` }}
                        title={`Delivered: ${pt.delivered}`}
                      />
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden opacity-60">
                      <div
                        className="bg-slate-400 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.max(schedPct, 3)}%` }}
                        title={`Scheduled: ${pt.scheduled}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Detailed Trend Points Table ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Period Trend Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tabular log of delivery volumes, fulfillment ratios, swaps, and cancellations per bucket.
          </p>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-4 rounded-l-xl">Bucket Period</th>
                <th className="py-3.5 px-4 text-right">Scheduled</th>
                <th className="py-3.5 px-4 text-right">Expected</th>
                <th className="py-3.5 px-4 text-right">Delivered</th>
                <th className="py-3.5 px-4 text-right">Missed</th>
                <th className="py-3.5 px-4 text-right">Cancelled</th>
                <th className="py-3.5 px-4 text-right">Swaps</th>
                <th className="py-3.5 px-4 rounded-r-xl text-center">Fulfillment Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                    Loading records...
                  </td>
                </tr>
              ) : points.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-sm">
                    No records found for this period.
                  </td>
                </tr>
              ) : (
                points.map((pt, idx) => {
                  const rate = pt.completion_rate_pct != null ? pt.completion_rate_pct : 0;
                  const rateColor =
                    rate >= 95
                      ? "text-emerald-600 bg-emerald-50"
                      : rate >= 80
                      ? "text-amber-600 bg-amber-50"
                      : "text-rose-600 bg-rose-50";

                  return (
                    <tr key={pt.bucket || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-900">
                        {pt.bucket}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {pt.scheduled.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {pt.expected.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#36D068] font-oswald text-base">
                        {pt.delivered.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-rose-600">
                        {pt.missed > 0 ? pt.missed.toLocaleString() : "0"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                        {pt.cancelled.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-purple-600">
                        {pt.optional_swaps.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${rateColor}`}>
                          {rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Guidance & Action Footer ─── */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-[#36D068]" />
          </div>
          <div>
            <div className="font-semibold text-white">Logistics & Route Optimization</div>
            <div className="text-slate-400 text-xs mt-0.5">
              Consistent drops in completion rate indicate driver bottlenecks or vehicle scheduling issues.
            </div>
          </div>
        </div>

        {onSwitchToDeliveriesTab && (
          <button
            type="button"
            onClick={onSwitchToDeliveriesTab}
            className="px-4 py-2 rounded-xl bg-[#36D068] hover:bg-[#2fb85b] text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
          >
            <span>View Today&apos;s Deliveries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

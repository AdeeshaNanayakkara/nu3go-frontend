"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarClock,
  Package,
  Utensils,
  ChefHat,
  Sparkles,
  CalendarX,
  TrendingUp,
  RefreshCw,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import {
  analyticsService,
  type ForecastRes,
  type ForecastDayRes,
} from "@/services/api/analytics.service";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(ymd: string): { monthDay: string; fullDate: string } {
  try {
    const parts = ymd.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return {
        monthDay: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    }
    return { monthDay: ymd, fullDate: ymd };
  } catch {
    return { monthDay: ymd, fullDate: ymd };
  }
}

function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

interface DeliveryForecastViewProps {
  onSwitchToDeliveriesTab?: () => void;
}

export function DeliveryForecastView({
  onSwitchToDeliveriesTab,
}: DeliveryForecastViewProps) {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<ForecastRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const todayStr = useMemo(() => formatYMD(new Date()), []);
  const tomorrowStr = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return formatYMD(t);
  }, []);

  const fetchForecast = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getDeliveryForecast({ days });
      if (result) {
        setData(result);
      } else {
        setData(null);
      }
    } catch (err: unknown) {
      console.warn("[DeliveryForecastView] Error loading delivery forecast:", err);
      setError("Unable to load delivery forecast. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchForecast();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchForecast]);

  // Aggregated calculations across points
  const points: ForecastDayRes[] = useMemo(() => data?.points || [], [data?.points]);
  const totalExpected = useMemo(
    () => data?.total_expected ?? points.reduce((acc, p) => acc + (p.expected || 0), 0),
    [data?.total_expected, points]
  );
  const totalFixed = useMemo(() => points.reduce((acc, p) => acc + (p.fixed || 0), 0), [points]);
  const totalCustom = useMemo(() => points.reduce((acc, p) => acc + (p.custom || 0), 0), [points]);
  const totalCancelled = useMemo(() => points.reduce((acc, p) => acc + (p.cancelled || 0), 0), [points]);
  const totalSwaps = useMemo(() => points.reduce((acc, p) => acc + (p.optional_swaps || 0), 0), [points]);

  const daysCount = points.length || days || 1;
  const avgDaily = Math.round(totalExpected / daysCount);
  const fixedPct = totalExpected > 0 ? Math.round((totalFixed / totalExpected) * 100) : 0;
  const customPct = totalExpected > 0 ? Math.round((totalCustom / totalExpected) * 100) : 0;

  // Max daily expected for chart bar scaling
  const maxDaily = useMemo(() => {
    if (!points.length) return 100;
    const maxVal = Math.max(...points.map((p) => p.expected || 0));
    return maxVal > 0 ? maxVal : 100;
  }, [points]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 font-poppins">
      {/* ─── Header & Horizon Controls ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              Kitchen & Dispatch Demand Forecast
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              /api/v1/analytics/deliveries/forecast
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Upcoming Delivery & Kitchen Forecast
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Projected meal requirements starting today, broken down into Fixed vs Custom plans, accounting for known cancellations and optional dish swaps.
          </p>
        </div>

        {/* Days Horizon Selector */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {[
              { label: "7 Days", val: 7 },
              { label: "14 Days", val: 14 },
              { label: "30 Days", val: 30 },
            ].map((preset) => {
              const isSelected = days === preset.val;
              return (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setDays(preset.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={fetchForecast}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2 text-xs font-semibold border border-slate-200/70"
            title="Refresh forecast projections"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#36D068]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Forecast Summary Info Banner ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600 bg-sky-50/60 border border-sky-100 px-4 py-2.5 rounded-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarClock className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            Projecting forward <strong className="text-slate-900">{days} calendar days</strong> starting from{" "}
            <strong className="text-slate-900 font-mono">{points[0]?.date || todayStr}</strong>
            {points.length > 1 && (
              <>
                {" "}through <strong className="text-slate-900 font-mono">{points[points.length - 1].date}</strong>
              </>
            )}
          </span>
          <span className="hidden md:inline text-slate-400 font-bold">•</span>
          <span className="text-slate-500 hidden md:inline">
            Assumes auto-renewing fixed plans renew seamlessly
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {isLoading && (
            <span className="text-sky-700 font-medium text-xs flex items-center gap-1.5 shrink-0">
              <RefreshCw className="w-3 h-3 animate-spin" /> Forecasting...
            </span>
          )}
          {onSwitchToDeliveriesTab && (
            <button
              type="button"
              onClick={onSwitchToDeliveriesTab}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>View Today&apos;s Deliveries</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#36D068]" />
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchForecast}
            className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg text-xs hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── 6 Summary KPI Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Projected Meals */}
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 p-4 transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-oswald">
              Total Meals
            </span>
            <div className="p-2 rounded-xl bg-[#36D068]/20 text-[#15803D]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-poppins">
              {isLoading ? "..." : totalExpected.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Next {days} days total run
            </p>
          </div>
        </div>

        {/* 2. Daily Average Run */}
        <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/80 to-sky-100/30 p-4 transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-oswald">
              Daily Average
            </span>
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-poppins">
              {isLoading ? "..." : avgDaily.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Expected meals / day
            </p>
          </div>
        </div>

        {/* 3. Fixed Plan Volume */}
        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 to-indigo-100/30 p-4 transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-oswald">
              Fixed Plans
            </span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-poppins">
              {isLoading ? "..." : totalFixed.toLocaleString()}
            </div>
            <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">
              {isLoading ? "..." : `${fixedPct}% of volume`}
            </p>
          </div>
        </div>

        {/* 4. Custom Plan Volume */}
        <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50/80 to-teal-100/30 p-4 transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-oswald">
              Custom Plans
            </span>
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-poppins">
              {isLoading ? "..." : totalCustom.toLocaleString()}
            </div>
            <p className="text-[10px] text-teal-700 font-semibold mt-0.5">
              {isLoading ? "..." : `${customPct}% of volume`}
            </p>
          </div>
        </div>

        {/* 5. Known Cancellations */}
        <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/80 to-rose-100/30 p-4 transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-oswald">
              Cancellations
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <CalendarX className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-rose-900 tracking-tight font-poppins">
              {isLoading ? "..." : totalCancelled.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Excluded from prep
            </p>
          </div>
        </div>

        {/* 6. Optional Meal Swaps */}
        <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/80 to-purple-100/30 p-4 transition-all hover:shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-oswald">
              Optional Swaps
            </span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-purple-900 tracking-tight font-poppins">
              {isLoading ? "..." : totalSwaps.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Special dish variations
            </p>
          </div>
        </div>
      </div>

      {/* ─── Visual Daily Workload Bar Chart ─── */}
      <div className="border border-slate-200/80 rounded-2xl p-5 bg-gradient-to-b from-slate-50/50 to-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-oswald flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#36D068]" />
              Daily Production Load & Plan Breakdown
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Stacked distribution of Fixed (Indigo) and Custom (Emerald) meal prep per calendar day.
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-indigo-500" />
              Fixed Plans
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              Custom Plans
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-400" />
              Cancellations
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-purple-400" />
              Swaps
            </span>
          </div>
        </div>

        {/* The Visual Stacked Bars */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#36D068]" />
            Loading workload projection chart...
          </div>
        ) : points.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            No forecast points available for this period.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-2">
            {points.map((point) => {
              const isToday = point.date === todayStr;
              const isTomorrow = point.date === tomorrowStr;
              const { monthDay } = formatDisplayDate(point.date);
              const heightPct = Math.max(15, Math.round(((point.expected || 0) / maxDaily) * 100));

              const fixedProportion =
                point.expected > 0 ? ((point.fixed || 0) / point.expected) * 100 : 50;
              const customProportion =
                point.expected > 0 ? ((point.custom || 0) / point.expected) * 100 : 50;

              return (
                <div
                  key={point.date}
                  className={`p-3 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md ${
                    isToday
                      ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-200"
                      : isTomorrow
                      ? "bg-emerald-50/40 border-emerald-300"
                      : "bg-white border-slate-200/80"
                  }`}
                >
                  {/* Top Day Header */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold font-oswald uppercase text-slate-500">
                        {capitalizeFirst(point.weekday).slice(0, 3)}
                      </span>
                      {isToday && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-200 text-amber-900 font-oswald uppercase">
                          Today
                        </span>
                      )}
                      {isTomorrow && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-200 text-emerald-900 font-oswald uppercase">
                          Tomorrow
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {monthDay}
                    </div>
                  </div>

                  {/* Centered Bar & Metric */}
                  <div className="py-3 flex flex-col items-center">
                    <span className="text-lg font-black text-slate-900 font-poppins">
                      {point.expected}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      meals
                    </span>

                    {/* Proportional Stacked Height Bar */}
                    <div
                      className="w-full bg-slate-100 rounded-lg overflow-hidden mt-2 flex flex-col justify-end"
                      style={{ height: "64px" }}
                    >
                      <div
                        className="w-full flex flex-col rounded-lg overflow-hidden transition-all"
                        style={{ height: `${heightPct}%` }}
                      >
                        <div
                          className="w-full bg-indigo-500"
                          style={{ height: `${fixedProportion}%` }}
                          title={`Fixed: ${point.fixed}`}
                        />
                        <div
                          className="w-full bg-emerald-500"
                          style={{ height: `${customProportion}%` }}
                          title={`Custom: ${point.custom}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Day Footnotes */}
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-indigo-600 font-semibold">Fixed: {point.fixed}</span>
                      <span className="text-emerald-700 font-semibold">Cust: {point.custom}</span>
                    </div>

                    {(point.cancelled > 0 || point.optional_swaps > 0) && (
                      <div className="flex items-center justify-between text-[9px] pt-0.5">
                        {point.cancelled > 0 ? (
                          <span className="text-rose-600 font-semibold">
                            -{point.cancelled} can.
                          </span>
                        ) : <span />}
                        {point.optional_swaps > 0 && (
                          <span className="text-purple-700 font-semibold">
                            ★ {point.optional_swaps} swp
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Day-by-Day Forecast Manifest Table ─── */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide font-oswald flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#36D068]" />
            Detailed Production Schedule
          </h3>
          <span className="text-xs text-slate-500">
            {points.length} scheduled delivery days in forecast window
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs">
          <table className="w-full text-left text-xs font-poppins">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Date & Day</th>
                <th className="py-3 px-4">Total Expected</th>
                <th className="py-3 px-4">Fixed Plan Meals</th>
                <th className="py-3 px-4">Custom Plan Meals</th>
                <th className="py-3 px-4">Plan Split (Ratio)</th>
                <th className="py-3 px-4">Cancellations</th>
                <th className="py-3 px-4">Optional Swaps</th>
                <th className="py-3 px-4">Kitchen Load Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2" />
                    Loading forecast manifest...
                  </td>
                </tr>
              ) : points.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No forecast points recorded.
                  </td>
                </tr>
              ) : (
                points.map((point) => {
                  const isToday = point.date === todayStr;
                  const isTomorrow = point.date === tomorrowStr;
                  const { fullDate } = formatDisplayDate(point.date);
                  const fixedRatio = point.expected > 0 ? Math.round((point.fixed / point.expected) * 100) : 0;
                  const customRatio = point.expected > 0 ? Math.round((point.custom / point.expected) * 100) : 0;

                  // Kitchen Load Tag
                  const isPeak = point.expected >= avgDaily * 1.15;
                  const isLight = point.expected <= avgDaily * 0.85;

                  return (
                    <tr
                      key={point.date}
                      className={`transition-colors hover:bg-slate-50/70 ${
                        isToday ? "bg-amber-50/40" : isTomorrow ? "bg-emerald-50/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{fullDate}</span>
                              {isToday && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  TODAY
                                </span>
                              )}
                              {isTomorrow && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                                  TOMORROW
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {point.date}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-sm font-bold text-slate-900 font-poppins">
                          {point.expected.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          meals
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-indigo-700">
                          {point.fixed.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {fixedRatio}% of day
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-emerald-800">
                          {point.custom.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {customRatio}% of day
                        </span>
                      </td>

                      <td className="py-3 px-4 min-w-[130px]">
                        <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
                          <div
                            className="bg-indigo-500 h-2"
                            style={{ width: `${fixedRatio}%` }}
                            title={`Fixed: ${fixedRatio}%`}
                          />
                          <div
                            className="bg-emerald-500 h-2"
                            style={{ width: `${customRatio}%` }}
                            title={`Custom: ${customRatio}%`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                          <span>{fixedRatio}% Fixed</span>
                          <span>{customRatio}% Cust</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {point.cancelled > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800">
                            -{point.cancelled}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {point.optional_swaps > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800">
                            ★ {point.optional_swaps}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-oswald ${
                            isPeak
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : isLight
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {isPeak ? "Peak Run" : isLight ? "Light Run" : "Standard"}
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

      {/* ─── Operational Sourcing & Kitchen Guidance ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase font-oswald tracking-wide">
              Batch Production Scaling
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Fixed plans are standardized recipes. Use the {fixedPct}% fixed volume projection to pre-portion staples and ingredients.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase font-oswald tracking-wide">
              Custom Dietary Preparation
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Custom plans and optional meal swaps require individualized assembly. Allocate prep line stations to handle custom specifications.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-[#15803D] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase font-oswald tracking-wide">
              Fulfillment Accuracy
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              All projections automatically subtract customer meal cancellations. Expected numbers reflect actual dishes to cook and pack.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

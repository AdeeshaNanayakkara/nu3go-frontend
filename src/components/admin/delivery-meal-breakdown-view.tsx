"use client";

import { useState, useCallback, useEffect } from "react";
import {
  UtensilsCrossed,
  RefreshCw,
  AlertCircle,
  Calendar,
  ChefHat,
  Layers,
  Star,
  Zap,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import {
  deliveryService,
  type MealSummaryRes,
  type DayMealSummaryRes,
  type MealCountRes,
} from "@/services/api/delivery.service";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(ymd: string): string {
  try {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return ymd;
  }
}

function SourceBar({ menu, optional, emergency, total }: { menu: number; optional: number; emergency: number; total: number }) {
  if (total === 0) return <div className="h-1.5 w-full rounded-full bg-slate-100" />;
  const menuPct = (menu / total) * 100;
  const optPct = (optional / total) * 100;
  const emgPct = (emergency / total) * 100;
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 flex overflow-hidden">
      <div className="bg-blue-500 h-full" style={{ width: `${menuPct}%` }} title={`Menu: ${menu}`} />
      <div className="bg-emerald-500 h-full" style={{ width: `${optPct}%` }} title={`Optional: ${optional}`} />
      <div className="bg-amber-500 h-full" style={{ width: `${emgPct}%` }} title={`Emergency: ${emergency}`} />
    </div>
  );
}

function MealCountTable({ meals, caption }: { meals: MealCountRes[]; caption?: string }) {
  if (!meals || meals.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic py-2 text-center">No meal data for this period.</p>
    );
  }
  const sorted = [...meals].sort((a, b) => b.total - a.total);
  return (
    <div className="overflow-x-auto">
      {caption && <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2">{caption}</p>}
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
            <th className="py-2.5 px-3 rounded-l-lg">Meal</th>
            <th className="py-2.5 px-3 text-right">Total</th>
            <th className="py-2.5 px-3 text-right">Menu</th>
            <th className="py-2.5 px-3 text-right">Optional</th>
            <th className="py-2.5 px-3 text-right rounded-r-lg">Emergency</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sorted.map((m) => (
            <tr key={m.meal_id} className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 px-3">
                <div className="font-semibold text-slate-800">{m.meal_name || "—"}</div>
                <SourceBar menu={m.menu} optional={m.optional} emergency={m.emergency} total={m.total} />
              </td>
              <td className="py-2.5 px-3 text-right font-black text-slate-900">{m.total}</td>
              <td className="py-2.5 px-3 text-right">
                <span className="text-blue-700 font-semibold">{m.menu}</span>
              </td>
              <td className="py-2.5 px-3 text-right">
                <span className="text-emerald-700 font-semibold">{m.optional}</span>
              </td>
              <td className="py-2.5 px-3 text-right">
                <span className={`font-semibold ${m.emergency > 0 ? "text-amber-600" : "text-slate-400"}`}>
                  {m.emergency}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DayCard({ day }: { day: DayMealSummaryRes }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#36D068]/10 text-[#36D068] shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{formatDisplayDate(day.date)}</p>
            <p className="text-[11px] text-slate-400 font-medium capitalize">{day.weekday}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs font-bold text-slate-800">{day.total_deliveries}</p>
            <p className="text-[10px] text-slate-400">deliveries</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">{day.meals?.length ?? 0}</p>
            <p className="text-[10px] text-slate-400">meal types</p>
          </div>
          {day.unassigned > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-600">{day.unassigned}</p>
              <p className="text-[10px] text-amber-500">unassigned</p>
            </div>
          )}
          <div className={`w-5 h-5 flex items-center justify-center transition-transform ${expanded ? "rotate-180" : ""}`}>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100">
          <MealCountTable meals={day.meals} />
        </div>
      )}
    </div>
  );
}

interface Props {
  onSwitchToDeliveriesTab?: () => void;
}

export function DeliveryMealBreakdownView({ onSwitchToDeliveriesTab }: Props) {
  const today = formatYMD(new Date());
  const nextWeek = formatYMD(new Date(Date.now() + 6 * 86400000));

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(nextWeek);
  const [data, setData] = useState<MealSummaryRes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await deliveryService.getMealSummary(fromDate, toDate);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load meal breakdown.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Date range controls */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => e.target.value && setFromDate(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
          <span className="text-slate-400 text-sm font-semibold">—</span>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => e.target.value && setToDate(e.target.value)}
                min={fromDate}
                className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-16 shadow-sm text-center">
          <RefreshCw className="w-8 h-8 text-[#36D068] animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Loading meal breakdown...</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-10 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-sm font-bold text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Data */}
      {!isLoading && !error && data && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-4 h-4 text-[#36D068]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Deliveries</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{data.total_deliveries}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formatDisplayDate(data.from)} – {formatDisplayDate(data.to)}
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Layers className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Meal Types</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{data.totals?.length ?? 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Distinct meals to prepare</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Days in Range</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{data.days?.length ?? 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Delivery days</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unassigned</span>
              </div>
              <p className={`text-2xl font-black ${data.unassigned > 0 ? "text-amber-600" : "text-slate-400"}`}>
                {data.unassigned}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">No menu meal resolved</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium px-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Menu scheduled</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Optional swap</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />Emergency change</span>
          </div>

          {/* Range totals table */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-[#36D068]/10 text-[#36D068]">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Range Totals</h2>
                <p className="text-xs text-slate-500">Aggregate meal counts for the full date range — use for ingredient ordering.</p>
              </div>
            </div>
            <MealCountTable meals={data.totals} />
          </div>

          {/* Per-day breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              <UtensilsCrossed className="w-5 h-5 text-[#36D068]" />
              <h2 className="text-base font-bold text-slate-900">Per-Day Breakdown</h2>
              <span className="text-xs text-slate-400 font-medium">Click a day to expand its meal list</span>
            </div>
            {data.days && data.days.length > 0 ? (
              data.days.map((day) => <DayCard key={day.date} day={day} />)
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center">
                <UtensilsCrossed className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">No delivery days found in this range.</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your date range.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  UtensilsCrossed,
  Users,
  Award,
  Sparkles,
  RefreshCw,
  Calendar,
  Search,
  ArrowRight,
  Info,
  Layers,
  Flame,
  CalendarRange,
  TrendingUp,
} from "lucide-react";
import {
  analyticsService,
  type OptionalMealsRes,
  type OptionalMealItemRes,
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

interface DeliveryOptionalMealsViewProps {
  onSwitchToDeliveriesTab?: () => void;
}

export function DeliveryOptionalMealsView({ onSwitchToDeliveriesTab }: DeliveryOptionalMealsViewProps) {
  // Preset selector
  const [preset, setPreset] = useState<DatePreset>("30d");

  // Custom date bounds (default to last 30 days)
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  // Limit of items
  const [limit, setLimit] = useState<number>(15);

  // Search filter inside table
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Data states
  const [data, setData] = useState<OptionalMealsRes | null>(null);
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

  // Main data fetch from /api/v1/analytics/deliveries/optional-meals
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getDeliveryOptionalMeals({
        from: fromDate,
        to: toDate,
        limit,
      });
      setData(result);
    } catch (err: unknown) {
      console.warn("[DeliveryOptionalMealsView] Error fetching optional meals:", err);
      setError("Unable to load optional meals analytics. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Derived calculations
  const items: OptionalMealItemRes[] = useMemo(() => data?.items || [], [data?.items]);

  const totalRequests = useMemo(
    () => items.reduce((acc, it) => acc + (it.requests || 0), 0),
    [items]
  );

  const totalUniqueCustomers = useMemo(
    () => items.reduce((acc, it) => acc + (it.unique_customers || 0), 0),
    [items]
  );

  const topMeal = useMemo(() => {
    if (!items.length) return null;
    return items.reduce((prev, curr) => (curr.requests > prev.requests ? curr : prev), items[0]);
  }, [items]);

  const maxRequests = useMemo(() => {
    if (!items.length) return 1;
    return Math.max(...items.map((i) => i.requests || 0), 1);
  }, [items]);

  const avgRequestsPerCustomer = useMemo(() => {
    if (totalUniqueCustomers === 0) return "0.0";
    return (totalRequests / totalUniqueCustomers).toFixed(1);
  }, [totalRequests, totalUniqueCustomers]);

  // Filtered table rows
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (it) => it.name.toLowerCase().includes(q) || it.meal_id.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ─── Filter & Range Banner ─── */}
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

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Limit:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                aria-label="Number of meals to display"
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={25}>Top 25</option>
                <option value={50}>Top 50</option>
              </select>
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
              Analyzing optional meal requests from{" "}
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
            Endpoint: <code className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">/api/v1/analytics/deliveries/optional-meals</code>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Optional Swaps */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:border-[#36D068]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Swaps Requested
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#36D068]/15 text-[#36D068] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-oswald tracking-tight">
            {isLoading ? "—" : totalRequests.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Across all {items.length} recipe alternatives</span>
          </p>
        </div>

        {/* Card 2: Requesting Customers */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:border-blue-400/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Requesting Customers
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-oswald tracking-tight">
            {isLoading ? "—" : totalUniqueCustomers.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>Average {avgRequestsPerCustomer} swaps / customer</span>
          </p>
        </div>

        {/* Card 3: Top Requested Recipe */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              #1 Most Requested Meal
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 truncate" title={topMeal?.name || "None"}>
            {isLoading ? "—" : topMeal ? topMeal.name : "No requests"}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <strong className="text-amber-600 font-semibold">{topMeal?.requests || 0} requests</strong>
            {totalRequests > 0 && topMeal
              ? ` (${Math.round((topMeal.requests / totalRequests) * 100)}% share)`
              : ""}
          </p>
        </div>

        {/* Card 4: Catalog Variety */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:border-purple-400/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Meal Varieties
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-oswald tracking-tight">
            {isLoading ? "—" : items.length}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>Excludes cancelled swap requests</span>
          </p>
        </div>
      </div>

      {/* ─── Visual Rank Bar Chart ─── */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#36D068]" />
              <span>Optional Meal Popularity Ranking</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual breakdown of customer choice preferences for optional meal replacements.
            </p>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-[#36D068]"></span>
            <span>Relative Request Volume</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#36D068]" />
            <span className="text-sm font-medium">Loading popularity rankings...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No optional meal swap requests recorded in this date range.
          </div>
        ) : (
          <div className="space-y-3.5">
            {items.slice(0, 10).map((meal, index) => {
              const pctOfMax = Math.round((meal.requests / maxRequests) * 100);
              const shareOfTotal =
                totalRequests > 0 ? Math.round((meal.requests / totalRequests) * 100) : 0;
              const rankBadge =
                index === 0
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : index === 1
                  ? "bg-slate-200 text-slate-800 border-slate-300"
                  : index === 2
                  ? "bg-amber-50 text-amber-900 border-amber-200"
                  : "bg-slate-50 text-slate-600 border-slate-200";

              return (
                <div
                  key={meal.meal_id || index}
                  className="p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200/80"
                >
                  <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center border ${rankBadge}`}
                      >
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate" title={meal.name}>
                        {meal.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <span className="text-slate-400 hidden sm:inline">
                        {meal.unique_customers} customer{meal.unique_customers === 1 ? "" : "s"}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                        {shareOfTotal}% share
                      </span>
                      <span className="font-extrabold text-slate-900 font-oswald text-base min-w-[50px] text-right">
                        {meal.requests.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#36D068] h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(pctOfMax, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Detailed Meal Data Table ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-[#36D068]" />
              <span>Optional Meals Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete list of meals requested by subscribers as replacement options.
            </p>
          </div>

          {/* Table search filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by meal name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#36D068]"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-4 rounded-l-xl">Rank</th>
                <th className="py-3.5 px-4">Meal Recipe</th>
                <th className="py-3.5 px-4 text-right">Total Requests</th>
                <th className="py-3.5 px-4 text-right">Unique Customers</th>
                <th className="py-3.5 px-4 text-right">Volume Share</th>
                <th className="py-3.5 px-4 text-right">Avg / Customer</th>
                <th className="py-3.5 px-4 rounded-r-xl text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    Loading meals...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    No matching meals found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((meal, idx) => {
                  const sharePct =
                    totalRequests > 0 ? ((meal.requests / totalRequests) * 100).toFixed(1) : "0.0";
                  const perCust =
                    meal.unique_customers > 0
                      ? (meal.requests / meal.unique_customers).toFixed(1)
                      : "1.0";
                  const isHighDemand = Number(sharePct) >= 15;

                  return (
                    <tr
                      key={meal.meal_id || idx}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 font-semibold">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-[#36D068] transition-colors">
                          {meal.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                          {meal.meal_id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-oswald text-base">
                        {meal.requests.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700 font-medium">
                        {meal.unique_customers.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        {sharePct}%
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 font-mono text-xs">
                        {perCust}x
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isHighDemand ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#36D068]/15 text-[#36D068]">
                            <Flame className="w-3 h-3" />
                            High Demand
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                            Standard
                          </span>
                        )}
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
            <div className="font-semibold text-white">Menu Planning Optimization</div>
            <div className="text-slate-400 text-xs mt-0.5">
              High-ranking optional meals can be promoted into core fixed packages to boost subscriber retention.
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


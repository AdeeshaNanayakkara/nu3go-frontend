"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Trophy,
  Medal,
  Crown,
  Award,
  DollarSign,
  Receipt,
  CalendarX,
  Calendar,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserX,
  Info,
  Filter,
  CheckCircle2,
} from "lucide-react";
import {
  analyticsService,
  type TopCustomerItem,
  type TopCustomersRes,
  type OffsetMeta,
} from "@/services/api/analytics.service";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(isoStr?: string): string {
  if (!isoStr) return "N/A";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoStr;
  }
}

function formatLKR(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return "LKR 0.00";
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

type SortMetric = "revenue" | "paid_invoices" | "cancellations";
type DatePreset = "30d" | "7d" | "90d" | "month" | "custom";

interface CustomerLeaderboardProps {
  initialSort?: SortMetric;
}

export function CustomerLeaderboard({ initialSort = "revenue" }: CustomerLeaderboardProps) {
  const [sortMetric, setSortMetric] = useState<SortMetric>(initialSort);
  const [preset, setPreset] = useState<DatePreset>("30d");

  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  const [data, setData] = useState<TopCustomersRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Apply Preset Handler
  const handleApplyPreset = (p: DatePreset) => {
    setPreset(p);
    const now = new Date();
    const endStr = formatYMD(now);
    setToDate(endStr);
    setPage(1); // Reset to page 1 on filter change

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

  const handleSortChange = (newSort: SortMetric) => {
    setSortMetric(newSort);
    setPage(1);
  };

  // Fetch Leaderboard
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getTopCustomers({
        from: fromDate,
        to: toDate,
        sort: sortMetric,
        page,
        limit,
      });
      if (res) {
        setData(res);
      } else {
        setData({
          data: [],
          pagination: {
            has_next: false,
            has_prev: false,
            limit,
            page,
            total_pages: 1,
            total_rows: 0,
          },
        });
      }
    } catch (err: unknown) {
      console.error("[CustomerLeaderboard] Error fetching top customers:", err);
      setError("Failed to load customer leaderboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, sortMetric, page, limit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const customers = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    total_pages: 1,
    total_rows: 0,
    has_next: false,
    has_prev: false,
  };

  // Top 3 for Podium
  const top1 = customers[0];
  const top2 = customers[1];
  const top3 = customers[2];

  // Aggregated totals in view
  const viewTotals = useMemo(() => {
    return customers.reduce(
      (acc, c) => {
        acc.revenue += c.revenue || 0;
        acc.paidInvoices += c.paid_invoices || 0;
        acc.cancellations += c.cancellations || 0;
        if (c.status === "active") acc.activeCount += 1;
        return acc;
      },
      { revenue: 0, paidInvoices: 0, cancellations: 0, activeCount: 0 }
    );
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* ─── Filter & Control Header Card ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Customer Performance Leaderboard
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Rank customers by high-value metrics over the selected timeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLeaderboard}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all flex items-center gap-2 border border-slate-200 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metric Sort Tabs + Date Presets Toolbar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Left: Metric Sort Switcher */}
          <div className="lg:col-span-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Rank By:
            </span>
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-xs">
              <button
                type="button"
                onClick={() => handleSortChange("revenue")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  sortMetric === "revenue"
                    ? "bg-[#36D068] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Revenue</span>
              </button>

              <button
                type="button"
                onClick={() => handleSortChange("paid_invoices")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  sortMetric === "paid_invoices"
                    ? "bg-[#36D068] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Paid Invoices</span>
              </button>

              <button
                type="button"
                onClick={() => handleSortChange("cancellations")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  sortMetric === "cancellations"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <CalendarX className="w-3.5 h-3.5" />
                <span>Cancellations</span>
              </button>
            </div>
          </div>

          {/* Right: Date Presets & Custom Pickers */}
          <div className="lg:col-span-6 flex flex-wrap items-center justify-start lg:justify-end gap-2">
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-xs">
              <button
                type="button"
                onClick={() => handleApplyPreset("7d")}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  preset === "7d"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                7D
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("30d")}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  preset === "30d"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                30D
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("90d")}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  preset === "90d"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                90D
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("month")}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  preset === "month"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setPreset("custom")}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  preset === "custom"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Dates Inputs */}
            {preset === "custom" && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-xl text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-hidden"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notice Info Pill */}
        <div className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-800">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Leaderboard Criteria:</strong> Showing customers ranked by{" "}
            <strong>
              {sortMetric === "revenue"
                ? "total revenue earned"
                : sortMetric === "paid_invoices"
                ? "number of completed paid invoices"
                : "total meal cancellations"}
            </strong>{" "}
            between <strong>{fromDate}</strong> and <strong>{toDate}</strong>. Only accounts with a
            non-zero value for this metric are listed.
          </span>
        </div>
      </div>

      {/* ─── Top 3 Podium Showcase ─── */}
      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank #2 (Silver) */}
          <div
            className={`order-2 md:order-1 rounded-3xl p-5 border transition-all ${
              top2
                ? "bg-gradient-to-b from-slate-50/90 to-white border-slate-300 shadow-sm hover:shadow-md"
                : "bg-slate-50/40 border-dashed border-slate-200 opacity-60 flex flex-col items-center justify-center min-h-[220px]"
            }`}
          >
            {top2 ? (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-800 font-extrabold flex items-center justify-center text-xl shadow-inner border-2 border-white">
                    {top2.email?.[0]?.toUpperCase() || "2"}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-slate-700 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    🥈 #2
                  </span>
                </div>

                <div className="min-w-0 max-w-full">
                  <p className="font-bold text-slate-900 text-sm truncate" title={top2.email}>
                    {top2.email}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      top2.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {top2.status}
                  </span>
                </div>

                <div className="w-full bg-slate-100/80 rounded-2xl p-3 border border-slate-200/60">
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {sortMetric === "revenue"
                      ? "Revenue"
                      : sortMetric === "paid_invoices"
                      ? "Paid Invoices"
                      : "Cancellations"}
                  </p>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {sortMetric === "revenue"
                      ? formatLKR(top2.revenue)
                      : sortMetric === "paid_invoices"
                      ? `${top2.paid_invoices} invoices`
                      : `${top2.cancellations} meals`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full text-xs text-slate-500 pt-1">
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Invoices</p>
                    <p className="font-bold text-slate-700">{top2.paid_invoices}</p>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Cancellations</p>
                    <p className="font-bold text-slate-700">{top2.cancellations}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No #2 ranked customer yet</p>
            )}
          </div>

          {/* Rank #1 (Gold - Elevated Champion Card) */}
          <div
            className={`order-1 md:order-2 rounded-3xl p-6 border-2 transition-all relative overflow-hidden ${
              top1
                ? "bg-gradient-to-b from-amber-500/10 via-amber-50/50 to-white border-amber-400/80 shadow-md hover:shadow-lg md:-translate-y-2"
                : "bg-slate-50/40 border-dashed border-slate-200 opacity-60 flex flex-col items-center justify-center min-h-[240px]"
            }`}
          >
            {top1 && (
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                <Crown className="w-3 h-3 fill-amber-950" />
                <span>Champion</span>
              </div>
            )}

            {top1 ? (
              <div className="flex flex-col items-center text-center space-y-3.5">
                <div className="relative mt-2">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-200 text-amber-950 font-black flex items-center justify-center text-2xl shadow-md border-4 border-white ring-4 ring-amber-300/40">
                    {top1.email?.[0]?.toUpperCase() || "1"}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border-2 border-white">
                    🥇 #1
                  </span>
                </div>

                <div className="min-w-0 max-w-full">
                  <p className="font-black text-slate-900 text-base truncate" title={top1.email}>
                    {top1.email}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      top1.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {top1.status}
                  </span>
                </div>

                <div className="w-full bg-gradient-to-r from-amber-100/80 to-yellow-100/60 rounded-2xl p-3.5 border border-amber-300/70 shadow-inner">
                  <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                    {sortMetric === "revenue"
                      ? "Total Revenue"
                      : sortMetric === "paid_invoices"
                      ? "Paid Invoices"
                      : "Meal Cancellations"}
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-amber-950 mt-0.5">
                    {sortMetric === "revenue"
                      ? formatLKR(top1.revenue)
                      : sortMetric === "paid_invoices"
                      ? `${top1.paid_invoices} invoices`
                      : `${top1.cancellations} meals`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full text-xs text-slate-600 pt-1">
                  <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100 shadow-xs">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                      Paid Invoices
                    </p>
                    <p className="font-black text-slate-800 text-sm">{top1.paid_invoices}</p>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-amber-100 shadow-xs">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                      Cancellations
                    </p>
                    <p className="font-black text-slate-800 text-sm">{top1.cancellations}</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Joined: {formatDate(top1.joined_at)} • Last Paid: {formatDate(top1.last_paid_at)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No #1 ranked customer yet</p>
            )}
          </div>

          {/* Rank #3 (Bronze) */}
          <div
            className={`order-3 rounded-3xl p-5 border transition-all ${
              top3
                ? "bg-gradient-to-b from-orange-50/70 to-white border-orange-200 shadow-sm hover:shadow-md"
                : "bg-slate-50/40 border-dashed border-slate-200 opacity-60 flex flex-col items-center justify-center min-h-[220px]"
            }`}
          >
            {top3 ? (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-700 to-orange-400 text-white font-extrabold flex items-center justify-center text-xl shadow-inner border-2 border-white">
                    {top3.email?.[0]?.toUpperCase() || "3"}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-800 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    🥉 #3
                  </span>
                </div>

                <div className="min-w-0 max-w-full">
                  <p className="font-bold text-slate-900 text-sm truncate" title={top3.email}>
                    {top3.email}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      top3.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {top3.status}
                  </span>
                </div>

                <div className="w-full bg-orange-50/80 rounded-2xl p-3 border border-orange-200/60">
                  <p className="text-[11px] font-medium text-orange-900 uppercase tracking-wider">
                    {sortMetric === "revenue"
                      ? "Revenue"
                      : sortMetric === "paid_invoices"
                      ? "Paid Invoices"
                      : "Cancellations"}
                  </p>
                  <p className="text-lg font-extrabold text-orange-950 mt-0.5">
                    {sortMetric === "revenue"
                      ? formatLKR(top3.revenue)
                      : sortMetric === "paid_invoices"
                      ? `${top3.paid_invoices} invoices`
                      : `${top3.cancellations} meals`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full text-xs text-slate-500 pt-1">
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Invoices</p>
                    <p className="font-bold text-slate-700">{top3.paid_invoices}</p>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400">Cancellations</p>
                    <p className="font-bold text-slate-700">{top3.cancellations}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No #3 ranked customer yet</p>
            )}
          </div>
        </div>
      )}

      {/* ─── View Summary Cards ─── */}
      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Customers on Page
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{customers.length}</p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {pagination.total_rows} total qualified
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Page Revenue
            </span>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">
              {formatLKR(viewTotals.revenue)}
            </p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Sum of current page</span>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Paid Invoices
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{viewTotals.paidInvoices}</p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Sum of current page</span>
          </div>

          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Meal Cancellations
            </span>
            <p className="text-xl font-extrabold text-rose-600 mt-1">
              {viewTotals.cancellations}
            </p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Sum of current page</span>
          </div>
        </div>
      )}

      {/* ─── Full Leaderboard Table Card ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base tracking-tight">
              Ranked Customers Directory
            </h3>
            <p className="text-xs text-slate-500">
              Showing rankings for {fromDate} to {toDate} sorted by {sortMetric.replace("_", " ")}.
            </p>
          </div>

          {/* Limit selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#36D068] animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Loading customer leaderboard rankings...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <button
              type="button"
              onClick={fetchLeaderboard}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Customers Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No customer activity recorded for the {sortMetric.replace("_", " ")} metric between{" "}
              {fromDate} and {toDate}. Try expanding your date range or selecting another metric.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-14 text-center">Rank</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th
                    className={`py-3 px-4 text-right cursor-pointer select-none ${
                      sortMetric === "revenue" ? "text-emerald-700 bg-emerald-50/50" : ""
                    }`}
                    onClick={() => handleSortChange("revenue")}
                  >
                    Revenue {sortMetric === "revenue" && "↓"}
                  </th>
                  <th
                    className={`py-3 px-4 text-center cursor-pointer select-none ${
                      sortMetric === "paid_invoices" ? "text-emerald-700 bg-emerald-50/50" : ""
                    }`}
                    onClick={() => handleSortChange("paid_invoices")}
                  >
                    Paid Invoices {sortMetric === "paid_invoices" && "↓"}
                  </th>
                  <th
                    className={`py-3 px-4 text-center cursor-pointer select-none ${
                      sortMetric === "cancellations" ? "text-rose-700 bg-rose-50/50" : ""
                    }`}
                    onClick={() => handleSortChange("cancellations")}
                  >
                    Cancellations {sortMetric === "cancellations" && "↓"}
                  </th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Last Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {customers.map((customer, index) => {
                  const globalRank = (pagination.page - 1) * pagination.limit + index + 1;
                  const isTop1 = globalRank === 1;
                  const isTop2 = globalRank === 2;
                  const isTop3 = globalRank === 3;

                  return (
                    <tr
                      key={customer.user_id || index}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isTop1
                          ? "bg-amber-50/20"
                          : isTop2
                          ? "bg-slate-50/30"
                          : isTop3
                          ? "bg-orange-50/20"
                          : ""
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-xs">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-xs shadow-xs">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs shadow-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
                            #{globalRank}
                          </span>
                        )}
                      </td>

                      {/* Customer Email & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#36D068]/15 text-[#36D068] font-bold flex items-center justify-center text-xs shrink-0">
                            {customer.email?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{customer.email}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              ID: {customer.user_id?.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            customer.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      {/* Revenue */}
                      <td
                        className={`py-3.5 px-4 text-right font-extrabold ${
                          sortMetric === "revenue"
                            ? "text-emerald-700 font-black text-sm"
                            : "text-slate-800"
                        }`}
                      >
                        {formatLKR(customer.revenue)}
                      </td>

                      {/* Paid Invoices */}
                      <td
                        className={`py-3.5 px-4 text-center ${
                          sortMetric === "paid_invoices"
                            ? "font-black text-slate-900 bg-emerald-50/40"
                            : "font-semibold text-slate-700"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Receipt className="w-3 h-3 text-slate-400" />
                          <span>{customer.paid_invoices}</span>
                        </span>
                      </td>

                      {/* Cancellations */}
                      <td
                        className={`py-3.5 px-4 text-center ${
                          sortMetric === "cancellations"
                            ? "font-black text-rose-700 bg-rose-50/40"
                            : "font-semibold text-slate-700"
                        }`}
                      >
                        {customer.cancellations > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                            <CalendarX className="w-3 h-3" />
                            <span>{customer.cancellations}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {formatDate(customer.joined_at)}
                      </td>

                      {/* Last Paid */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {formatDate(customer.last_paid_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && customers.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total_rows)} of{" "}
              {pagination.total_rows} ranked customers
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!pagination.has_prev}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-700 px-2">
                Page {pagination.page} of {Math.max(pagination.total_pages, 1)}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.has_next}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Layers,
  RefreshCw,
  Calendar,
  CalendarRange,
  DollarSign,
  Receipt,
  Users,
  Award,
  PieChart,
  Info,
  Box,
  CreditCard,
  Repeat,
} from "lucide-react";
import {
  analyticsService,
  type SalesBreakdownRes,
  type SalesBreakdownItemRes,
  type SalesBreakdownDimension,
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

function formatCurrency(val?: number, currency = "LKR"): string {
  if (val === undefined || val === null || isNaN(val)) return "—";
  return `${currency} ${val.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

const SEGMENT_PALETTE = [
  "#36D068", // Nu3Go Emerald
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#10B981", // Teal
  "#6366F1", // Indigo
];

export function SalesBreakdownView() {
  const [preset, setPreset] = useState<DatePreset>("30d");

  // Custom date bounds (default to last 30 days)
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  // Dimension: package | plan | billing_cycle | plan_type
  const [dimension, setDimension] = useState<SalesBreakdownDimension>("package");

  // Data states
  const [data, setData] = useState<SalesBreakdownRes | null>(null);
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

  // Main data fetch from /api/v1/analytics/sales/breakdown
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getSalesBreakdown({
        from: fromDate,
        to: toDate,
        by: dimension,
      });
      setData(result);
    } catch (err: unknown) {
      console.warn("[SalesBreakdownView] Error fetching sales breakdown:", err);
      setError("Unable to load sales breakdown analytics. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, dimension]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const currency = data?.currency || "LKR";
  const items: SalesBreakdownItemRes[] = useMemo(() => data?.items || [], [data?.items]);

  const totalRevenue = useMemo(
    () => data?.total_revenue ?? items.reduce((acc, it) => acc + (it.revenue || 0), 0),
    [data?.total_revenue, items]
  );

  const totalInvoices = useMemo(
    () => items.reduce((acc, it) => acc + (it.invoices || 0), 0),
    [items]
  );

  const totalCustomers = useMemo(
    () => items.reduce((acc, it) => acc + (it.customers || 0), 0),
    [items]
  );

  const topItem = useMemo(() => {
    if (!items.length) return null;
    return items.reduce((prev, curr) => (curr.revenue > prev.revenue ? curr : prev), items[0]);
  }, [items]);

  const avgTicket = useMemo(() => {
    if (totalInvoices === 0) return 0;
    return Math.round(totalRevenue / totalInvoices);
  }, [totalRevenue, totalInvoices]);

  const maxRevenue = useMemo(() => {
    if (!items.length) return 1;
    return Math.max(...items.map((i) => i.revenue || 0), 1);
  }, [items]);

  return (
    <div className="space-y-6">
      {/* ─── Filter & Dimension Controls ─── */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Preset Buttons */}
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

          {/* Dimension Selector + Refresh */}
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

            {/* Dimension Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <span className="text-xs text-slate-500 font-semibold px-2">Split By:</span>
              {(
                [
                  { id: "package", label: "Package", icon: Box },
                  { id: "plan", label: "Plan", icon: Layers },
                  { id: "billing_cycle", label: "Cycle", icon: Repeat },
                  { id: "plan_type", label: "Type", icon: CreditCard },
                ] as const
              ).map((d) => {
                const DIcon = d.icon;
                const isSelected = dimension === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDimension(d.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <DIcon className={`w-3.5 h-3.5 ${isSelected ? "text-[#36D068]" : "text-slate-400"}`} />
                    <span>{d.label}</span>
                  </button>
                );
              })}
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
              Analyzing net revenue breakdown by{" "}
              <strong className="text-slate-800 font-semibold uppercase">{dimension.replace("_", " ")}</strong> from{" "}
              <strong className="text-slate-800 font-semibold">{formatDateDisplay(data?.from || fromDate)}</strong> through{" "}
              <strong className="text-slate-800 font-semibold">{formatDateDisplay(data?.to || toDate)}</strong>
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Endpoint: <code className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">/api/v1/analytics/sales/breakdown</code>
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
        {/* Card 1: Total Revenue */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Net Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[#36D068]/15 text-[#36D068] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#36D068] font-oswald">
            {isLoading ? "—" : formatCurrency(totalRevenue, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Recognized on paid invoices</p>
        </div>

        {/* Card 2: Total Invoices */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Paid Invoices</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-oswald">
            {isLoading ? "—" : totalInvoices.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total completed payments</p>
        </div>

        {/* Card 3: Paying Customers */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600 font-oswald">
            {isLoading ? "—" : totalCustomers.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Unique subscribers contributing</p>
        </div>

        {/* Card 4: Top Contributor */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top Segment</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 truncate" title={topItem?.label || "None"}>
            {isLoading ? "—" : topItem ? topItem.label : "None"}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <strong className="text-amber-600 font-semibold">{topItem?.share_pct?.toFixed(1) || 0}% share</strong> of sales
          </p>
        </div>

        {/* Card 5: Average Ticket */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Ticket Size</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-oswald">
            {isLoading ? "—" : formatCurrency(avgTicket, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Per paid invoice average</p>
        </div>
      </div>

      {/* ─── Revenue Share Progress Bar ─── */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#36D068]" />
            <span>Revenue Share by {dimension.replace("_", " ").toUpperCase()}</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">100% total recognized revenue</span>
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-slate-400 text-xs">Calculating revenue distribution...</div>
        ) : items.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">No records available for this period.</div>
        ) : (
          <div className="space-y-3">
            {/* Multi-segment continuous bar */}
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
              {items.map((it, idx) => {
                const color = SEGMENT_PALETTE[idx % SEGMENT_PALETTE.length];
                const widthPct = Math.max(it.share_pct || 0, 1);
                return (
                  <div
                    key={it.key || idx}
                    className="h-full transition-all duration-500"
                    style={{ width: `${widthPct}%`, backgroundColor: color }}
                    title={`${it.label}: ${it.share_pct?.toFixed(1)}% (${formatCurrency(it.revenue, currency)})`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              {items.map((it, idx) => {
                const color = SEGMENT_PALETTE[idx % SEGMENT_PALETTE.length];
                return (
                  <div key={it.key || idx} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-semibold text-slate-800">{it.label}</span>
                    <span className="text-slate-400 font-medium">
                      ({it.share_pct?.toFixed(1)}% • {formatCurrency(it.revenue, currency)})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Detailed Segment Table ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Segment Revenue Breakdown</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked list of contributors with recognized sales, paid invoices, customer base, and ticket sizing.
          </p>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-4 rounded-l-xl">Segment</th>
                <th className="py-3.5 px-4 text-right">Recognized Revenue</th>
                <th className="py-3.5 px-4 text-right">Revenue Share</th>
                <th className="py-3.5 px-4 text-right">Paid Invoices</th>
                <th className="py-3.5 px-4 text-right">Customers</th>
                <th className="py-3.5 px-4 text-right">Avg / Customer</th>
                <th className="py-3.5 px-4 rounded-r-xl text-right">Avg / Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    Loading breakdown data...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    No breakdown data found for this selection.
                  </td>
                </tr>
              ) : (
                items.map((it, idx) => {
                  const color = SEGMENT_PALETTE[idx % SEGMENT_PALETTE.length];
                  const barWidth = Math.round(((it.revenue || 0) / maxRevenue) * 100);
                  const avgPerCust = it.customers > 0 ? Math.round(it.revenue / it.customers) : 0;
                  const avgPerInv = it.invoices > 0 ? Math.round(it.revenue / it.invoices) : 0;

                  return (
                    <tr key={it.key || idx} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#36D068] transition-colors">
                              {it.label}
                            </div>
                            {it.key !== it.label && (
                              <div className="text-[11px] font-mono text-slate-400 truncate max-w-[150px]">
                                {it.key}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-extrabold text-[#36D068] font-oswald text-base">
                          {formatCurrency(it.revenue, currency)}
                        </div>
                        <div className="w-20 bg-slate-100 h-1 rounded-full ml-auto mt-1 overflow-hidden">
                          <div
                            className="bg-[#36D068] h-full rounded-full"
                            style={{ width: `${Math.max(barWidth, 5)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        {it.share_pct?.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {it.invoices.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {it.customers.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                        {formatCurrency(avgPerCust, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                        {formatCurrency(avgPerInv, currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Financial Governance Guidance Footer ─── */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-[#36D068]" />
          </div>
          <div>
            <div className="font-semibold text-white">Segment Growth Strategy</div>
            <div className="text-slate-400 text-xs mt-0.5">
              Reviewing revenue split by package identifies top performers to promote, while cycle splits inform cashflow predictability.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp,
  RefreshCw,
  Calendar,
  CalendarRange,
  DollarSign,
  Receipt,
  Download,
  Info,
  CreditCard,
  Wallet,
  Tag,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  analyticsService,
  type SalesRevenueRes,
  type SalesRevenuePointRes,
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

function formatBucketLabel(bucket: string, granularity: "day" | "week" | "month"): string {
  if (!bucket) return "—";
  try {
    if (granularity === "day") {
      const parts = bucket.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }
    if (granularity === "month") {
      const parts = bucket.split("-");
      if (parts.length >= 2) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
        return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    }
    return bucket;
  } catch {
    return bucket;
  }
}

type DatePreset = "7d" | "30d" | "90d" | "month" | "custom";
type Granularity = "day" | "week" | "month";

function formatCurrency(val?: number, currency = "LKR"): string {
  if (val === undefined || val === null || isNaN(val)) return "—";
  return `${currency} ${val.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function SalesRevenueView() {
  const [preset, setPreset] = useState<DatePreset>("30d");

  // Custom date bounds (default to last 30 days)
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  // Granularity: day | week | month
  const [granularity, setGranularity] = useState<Granularity>("day");

  // Data states
  const [data, setData] = useState<SalesRevenueRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hover state for interactive chart
  const [hoveredPoint, setHoveredPoint] = useState<SalesRevenuePointRes | null>(null);

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
      setGranularity("day");
    } else if (p === "30d") {
      const f = new Date();
      f.setDate(f.getDate() - 30);
      setFromDate(formatYMD(f));
      setToDate(toStr);
      setGranularity("day");
    } else if (p === "90d") {
      const f = new Date();
      f.setDate(f.getDate() - 90);
      setFromDate(formatYMD(f));
      setToDate(toStr);
      setGranularity("week");
    } else if (p === "month") {
      const f = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(formatYMD(f));
      setToDate(toStr);
      setGranularity("day");
    }
  };

  // Main data fetch from /api/v1/analytics/sales/revenue
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getSalesRevenue({
        from: fromDate,
        to: toDate,
        granularity,
      });
      setData(res);
    } catch (err) {
      console.error("[SalesRevenueView] fetch error:", err);
      setError("Failed to fetch revenue analytics. Please try again.");
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

  const currency = data?.currency || "LKR";
  const points = useMemo(() => data?.points || [], [data]);

  // Aggregate totals across all returned buckets
  const summary = useMemo(() => {
    let gross = 0;
    let discounts = 0;
    let net = 0;
    let walletCredit = 0;
    let cashCollected = 0;
    let invoices = 0;
    let newRevenue = 0;
    let renewalRevenue = 0;

    for (const p of points) {
      gross += p.gross || 0;
      discounts += p.discounts || 0;
      net += p.net || 0;
      walletCredit += p.wallet_credit || 0;
      cashCollected += p.cash_collected || 0;
      invoices += p.invoices || 0;
      newRevenue += p.new_revenue || 0;
      renewalRevenue += p.renewal_revenue || 0;
    }

    const discountRate = gross > 0 ? (discounts / gross) * 100 : 0;
    const avgInvoiceValue = invoices > 0 ? net / invoices : 0;
    const newSharePct = net > 0 ? (newRevenue / net) * 100 : 0;
    const renewalSharePct = net > 0 ? (renewalRevenue / net) * 100 : 0;

    return {
      gross,
      discounts,
      net,
      walletCredit,
      cashCollected,
      invoices,
      newRevenue,
      renewalRevenue,
      discountRate,
      avgInvoiceValue,
      newSharePct,
      renewalSharePct,
    };
  }, [points]);

  // Max value calculation for bar chart height scaling
  const maxBarValue = useMemo(() => {
    if (points.length === 0) return 1;
    const maxVal = Math.max(
      ...points.map((p) => Math.max(p.net, p.gross, (p.new_revenue || 0) + (p.renewal_revenue || 0), 1))
    );
    return maxVal > 0 ? maxVal : 1;
  }, [points]);

  // Export table rows as CSV
  const handleExportCSV = () => {
    if (points.length === 0) return;
    const headers = [
      "Bucket",
      "Gross",
      "Discounts",
      "Net",
      "Wallet Credit",
      "Cash Collected",
      "Invoices",
      "New Revenue",
      "Renewal Revenue",
    ];
    const rows = points.map((p) => [
      p.bucket,
      p.gross,
      p.discounts,
      p.net,
      p.wallet_credit,
      p.cash_collected,
      p.invoices,
      p.new_revenue,
      p.renewal_revenue,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_revenue_${fromDate}_to_${toDate}_${granularity}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ─── Control Bar ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Granularity Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Granularity:
          </span>
          {(
            [
              { id: "day", label: "Daily" },
              { id: "week", label: "Weekly" },
              { id: "month", label: "Monthly" },
            ] as const
          ).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGranularity(g.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                granularity === g.id
                  ? "bg-[#36D068] text-white shadow-xs font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Right: Date Presets & Custom Range */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Presets */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
            {(
              [
                { id: "7d", label: "7D" },
                { id: "30d", label: "30D" },
                { id: "90d", label: "90D" },
                { id: "month", label: "This Month" },
                { id: "custom", label: "Custom" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  preset === p.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {preset === "custom" && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-medium focus:outline-none"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-medium focus:outline-none"
              />
            </div>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-2xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Refresh revenue analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#36D068]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Active Range & Currency Indicator ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 px-1 gap-2">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Displaying revenue time series from{" "}
            <strong className="text-slate-700 font-semibold">{formatDateDisplay(fromDate)}</strong> to{" "}
            <strong className="text-slate-700 font-semibold">{formatDateDisplay(toDate)}</strong> (
            {granularity} intervals)
          </span>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Currency: <span className="text-slate-900">{currency}</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Buckets: <span className="font-bold">{points.length}</span>
          </span>
        </div>
      </div>

      {/* ─── Error Notification ─── */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchData}
            className="underline font-semibold hover:text-rose-900 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── KPI Aggregate Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#36D068] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : formatCurrency(summary.net, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Gross: {formatCurrency(summary.gross, currency)}</span>
          </div>
        </div>

        {/* Cash Collected */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cash Collected</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : formatCurrency(summary.cashCollected, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            <span>Wallet credits: {formatCurrency(summary.walletCredit, currency)}</span>
          </div>
        </div>

        {/* New vs Renewal Split */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">New vs Renewal</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span className="text-emerald-600">{summary.newSharePct.toFixed(0)}% New</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600">{summary.renewalSharePct.toFixed(0)}% Renewal</span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden flex">
            <div
              className="bg-[#36D068] h-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, summary.newSharePct))}%` }}
              title={`New: ${summary.newSharePct.toFixed(1)}%`}
            />
            <div
              className="bg-blue-500 h-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, summary.renewalSharePct))}%` }}
              title={`Renewal: ${summary.renewalSharePct.toFixed(1)}%`}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{formatCurrency(summary.newRevenue, currency)}</span>
            <span>{formatCurrency(summary.renewalRevenue, currency)}</span>
          </div>
        </div>

        {/* Invoices & Discounts */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Paid Invoices</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : summary.invoices.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>{formatCurrency(summary.discounts, currency)} discounts</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Revenue Timeline Bar Chart ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#36D068]" />
              <span>Revenue Trend & Stream Composition</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Net revenue per {granularity} split by <strong className="text-emerald-600">New Revenue</strong> (first
              paid invoice) and <strong className="text-blue-600">Renewal Revenue</strong> (recurring billing).
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#36D068]" />
              <span className="text-slate-700">New Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-700">Renewal Revenue</span>
            </div>
          </div>
        </div>

        {/* Hover detail preview card if user hovers over a bar */}
        <div className="min-h-[44px] mb-4 bg-slate-50 border border-slate-200/70 rounded-2xl p-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
          {hoveredPoint ? (
            <>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-slate-800">
                  {formatBucketLabel(hoveredPoint.bucket, granularity)}
                </span>
                <span className="text-slate-600">
                  Net: <strong className="text-slate-900 font-bold">{formatCurrency(hoveredPoint.net, currency)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-medium">
                  New: <strong>{formatCurrency(hoveredPoint.new_revenue, currency)}</strong>
                </span>
                <span className="text-blue-700 font-medium">
                  Renewal: <strong>{formatCurrency(hoveredPoint.renewal_revenue, currency)}</strong>
                </span>
                <span className="text-slate-500">
                  Cash: <strong>{formatCurrency(hoveredPoint.cash_collected, currency)}</strong>
                </span>
                <span className="text-slate-500">
                  Invoices: <strong>{hoveredPoint.invoices}</strong>
                </span>
              </div>
            </>
          ) : (
            <span className="text-slate-400 italic flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Hover over any timeline bar below to view full period metrics.
            </span>
          )}
        </div>

        {/* The Bar Visualization */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#36D068]" />
            <span className="text-sm font-medium">Loading revenue time series...</span>
          </div>
        ) : points.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Info className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No revenue data for this range</p>
            <p className="text-xs text-slate-400 mt-1">Try expanding the date filter or changing granularity.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto pb-2">
            <div
              className="flex items-end gap-2 pt-6 pb-2 min-w-full"
              style={{ minHeight: "240px", width: Math.max(points.length * 36, 600) }}
            >
              {points.map((p, idx) => {
                const totalStack = (p.new_revenue || 0) + (p.renewal_revenue || 0);
                const stackHeightPct = Math.min(100, (totalStack / maxBarValue) * 100);
                const newPct = totalStack > 0 ? ((p.new_revenue || 0) / totalStack) * 100 : 0;
                const renewalPct = totalStack > 0 ? ((p.renewal_revenue || 0) / totalStack) * 100 : 0;

                const isHovered = hoveredPoint?.bucket === p.bucket;

                return (
                  <div
                    key={p.bucket || idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Bar Stack Container */}
                    <div
                      className={`w-full max-w-[40px] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all ${
                        isHovered ? "ring-2 ring-emerald-500 scale-y-105" : "hover:opacity-90"
                      }`}
                      style={{ height: `${Math.max(stackHeightPct, 4)}%` }}
                    >
                      {/* Renewal Portion (top) */}
                      <div
                        className="w-full bg-blue-500 transition-all"
                        style={{ height: `${renewalPct}%` }}
                      />
                      {/* New Revenue Portion (bottom) */}
                      <div
                        className="w-full bg-[#36D068] transition-all"
                        style={{ height: `${newPct}%` }}
                      />
                    </div>

                    {/* Bottom Label */}
                    <span
                      className={`text-[10px] mt-2 whitespace-nowrap transition-colors ${
                        isHovered ? "text-slate-900 font-bold" : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    >
                      {formatBucketLabel(p.bucket, granularity)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── Detailed Tabular Ledger ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-600" />
              <span>Revenue Ledger by Bucket</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Comprehensive line-item breakdown of billing, discounts, wallet redemptions, and cash collected.
            </p>
          </div>

          {/* Export to CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={points.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-2xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3 px-4">Period / Bucket</th>
                <th className="py-3 px-4 text-right">Gross</th>
                <th className="py-3 px-4 text-right">Discounts</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Net Revenue</th>
                <th className="py-3 px-4 text-right">Wallet Credit</th>
                <th className="py-3 px-4 text-right font-bold text-blue-700">Cash Collected</th>
                <th className="py-3 px-4 text-right">Invoices</th>
                <th className="py-3 px-4 text-right text-emerald-700">New Rev</th>
                <th className="py-3 px-4 text-right text-blue-700">Renewal Rev</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#36D068] mx-auto mb-2" />
                    <span>Loading ledger...</span>
                  </td>
                </tr>
              ) : points.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No data points found for this range.
                  </td>
                </tr>
              ) : (
                points.map((p) => (
                  <tr
                    key={p.bucket}
                    className="hover:bg-slate-50/70 transition-colors text-slate-700"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {p.bucket}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {formatCurrency(p.gross, currency)}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-600">
                      {p.discounts > 0 ? `-${formatCurrency(p.discounts, currency)}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(p.net, currency)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {p.wallet_credit > 0 ? formatCurrency(p.wallet_credit, currency) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700">
                      {formatCurrency(p.cash_collected, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {p.invoices.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      {formatCurrency(p.new_revenue, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-blue-700">
                      {formatCurrency(p.renewal_revenue, currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer Totals */}
            {points.length > 0 && !isLoading && (
              <tfoot>
                <tr className="bg-slate-50/90 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                  <td className="py-3.5 px-4 uppercase tracking-wider">Total ({points.length} buckets)</td>
                  <td className="py-3.5 px-4 text-right">{formatCurrency(summary.gross, currency)}</td>
                  <td className="py-3.5 px-4 text-right text-rose-600">
                    {summary.discounts > 0 ? `-${formatCurrency(summary.discounts, currency)}` : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">
                    {formatCurrency(summary.net, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right">{formatCurrency(summary.walletCredit, currency)}</td>
                  <td className="py-3.5 px-4 text-right text-blue-700">
                    {formatCurrency(summary.cashCollected, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right">{summary.invoices.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right text-emerald-700">
                    {formatCurrency(summary.newRevenue, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-blue-700">
                    {formatCurrency(summary.renewalRevenue, currency)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ─── Financial Guidance & Explanations ─── */}
      <div className="bg-gradient-to-r from-emerald-50/50 via-slate-50 to-blue-50/50 border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#36D068]" />
          Understanding Revenue Accounting in Nu3Go
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed mt-3">
          <div className="space-y-1">
            <strong className="text-slate-800 block">Gross vs Net Revenue</strong>
            <span>
              Gross represents billed amount before deductions. Net is calculated as Gross minus discounts and credits
              applied to customer orders.
            </span>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">New vs Renewal Revenue</strong>
            <span>
              <strong>New Revenue</strong> accounts for the customer&apos;s first paid invoice on a subscription plan.
              <strong> Renewal Revenue</strong> represents subsequent recurring automated renewal invoices.
            </span>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">Cash Collected vs Wallet</strong>
            <span>
              <strong>Cash Collected</strong> tracks external payments captured through payment gateways.
              <strong> Wallet Credit</strong> covers portion paid using customer store credits.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

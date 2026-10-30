"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Tag,
  RefreshCw,
  Calendar,
  CalendarRange,
  DollarSign,
  Receipt,
  Users,
  Percent,
  Search,
  Download,
  Copy,
  Check,
  TrendingUp,
  Info,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  analyticsService,
  type SalesDiscountsRes,
  type SalesDiscountItemRes,
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

export function SalesDiscountsView() {
  const [preset, setPreset] = useState<DatePreset>("30d");

  // Custom date bounds (default to last 30 days)
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Data states
  const [data, setData] = useState<SalesDiscountsRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Copy feedback state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  // Main data fetch from /api/v1/analytics/sales/discounts
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getSalesDiscounts({
        from: fromDate,
        to: toDate,
      });
      setData(res);
    } catch (err) {
      console.error("[SalesDiscountsView] fetch error:", err);
      setError("Failed to fetch discounts analytics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const currency = data?.currency || "LKR";
  const items: SalesDiscountItemRes[] = useMemo(() => data?.items || [], [data]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.coupon_code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Aggregates across all items
  const summary = useMemo(() => {
    const totalDiscountAmount = data?.total_discount ?? items.reduce((acc, i) => acc + (i.discount_total || 0), 0);
    const totalNetRevenue = items.reduce((acc, i) => acc + (i.net_revenue || 0), 0);
    const totalRedemptions = items.reduce((acc, i) => acc + (i.redemptions || 0), 0);
    const totalUniqueCustomers = items.reduce((acc, i) => acc + (i.unique_customers || 0), 0);
    const overallMultiplier = totalDiscountAmount > 0 ? totalNetRevenue / totalDiscountAmount : 0;
    const avgDiscountOverall = totalRedemptions > 0 ? totalDiscountAmount / totalRedemptions : 0;

    return {
      totalDiscountAmount,
      totalNetRevenue,
      totalRedemptions,
      totalUniqueCustomers,
      overallMultiplier,
      avgDiscountOverall,
    };
  }, [data, items]);

  // Max net revenue for bar visualization scaling
  const maxNetRevenue = useMemo(() => {
    if (items.length === 0) return 1;
    const maxVal = Math.max(...items.map((i) => i.net_revenue || 0));
    return maxVal > 0 ? maxVal : 1;
  }, [items]);

  // Copy coupon code to clipboard
  const handleCopyCode = (code: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Export CSV handler
  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;
    const headers = [
      "Coupon Code",
      "Promotion Name",
      "Discount Rate (%)",
      "Redemptions",
      "Unique Customers",
      "Total Discount",
      "Avg Discount",
      "Net Revenue Generated",
      "Revenue Multiplier",
    ];
    const rows = filteredItems.map((item) => [
      item.coupon_code,
      `"${item.name.replace(/"/g, '""')}"`,
      item.percentage,
      item.redemptions,
      item.unique_customers,
      item.discount_total,
      item.avg_discount,
      item.net_revenue,
      item.discount_total > 0 ? (item.net_revenue / item.discount_total).toFixed(2) : "0",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_discounts_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ─── Control Bar ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by coupon code or campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#36D068]/30 focus:border-[#36D068] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
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
            title="Refresh discount performance"
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
            Performance period from{" "}
            <strong className="text-slate-700 font-semibold">{formatDateDisplay(fromDate)}</strong> to{" "}
            <strong className="text-slate-700 font-semibold">{formatDateDisplay(toDate)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Currency: <span className="text-slate-900">{currency}</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active Promotions: <span className="font-bold">{items.length}</span>
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

      {/* ─── Aggregate KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Discounts Given */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Discounts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-rose-600">
            {isLoading ? "—" : formatCurrency(summary.totalDiscountAmount, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Avg discount / invoice: {formatCurrency(summary.avgDiscountOverall, currency)}</span>
          </div>
        </div>

        {/* Net Revenue Generated */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Discounted Net Rev</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#36D068] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : formatCurrency(summary.totalNetRevenue, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Generated from promo orders</span>
          </div>
        </div>

        {/* Campaign Revenue Multiplier (ROI) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenue Multiplier</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : `${summary.overallMultiplier.toFixed(1)}x`}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Revenue yield per LKR 1 discount</span>
          </div>
        </div>

        {/* Redemptions & Unique Customers */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Redemptions</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : summary.totalRedemptions.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{summary.totalUniqueCustomers.toLocaleString()} unique customers</span>
          </div>
        </div>
      </div>

      {/* ─── Campaign Impact Visual Breakdown ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-5 h-5 text-[#36D068]" />
              <span>Coupon Impact & Net Revenue Generation</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Comparison of paid invoice net revenue generated by each promotional campaign against discount cost.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#36D068]" />
            <span className="text-sm font-medium">Loading coupon performance...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Tag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No discount activity in this period</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? "No coupons matched your search query." : "Try choosing a broader date range."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const netPct = Math.min(100, (item.net_revenue / maxNetRevenue) * 100);
              const multiplier = item.discount_total > 0 ? item.net_revenue / item.discount_total : 0;

              return (
                <div
                  key={item.discount_id || item.coupon_code}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs font-mono tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        {item.coupon_code}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{item.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-semibold">
                        {item.percentage}% OFF
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-slate-500">
                        {item.redemptions} {item.redemptions === 1 ? "redemption" : "redemptions"} (
                        {item.unique_customers} users)
                      </span>
                      <span className="text-slate-900 font-bold">
                        Net: {formatCurrency(item.net_revenue, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Relative Revenue Bar */}
                  <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#36D068] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(netPct, 3)}%` }}
                      title={`Net Revenue: ${formatCurrency(item.net_revenue, currency)}`}
                    />
                  </div>

                  {/* Under-bar metrics */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span className="text-rose-600 font-medium">
                      Discount given: {formatCurrency(item.discount_total, currency)} (avg{" "}
                      {formatCurrency(item.avg_discount, currency)}/order)
                    </span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      Yield: {multiplier.toFixed(1)}x revenue multiple
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Detailed Discount Ledger Table ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-600" />
              <span>Discount Performance Ledger</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Line-item breakdown of redemptions, average discount per invoice, and net sales generated.
            </p>
          </div>

          {/* Export to CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredItems.length === 0}
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
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4 text-center">Rate</th>
                <th className="py-3 px-4 text-right">Redemptions</th>
                <th className="py-3 px-4 text-right">Customers</th>
                <th className="py-3 px-4 text-right text-rose-600">Total Discount</th>
                <th className="py-3 px-4 text-right">Avg / Order</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Net Revenue</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-700">Yield Multiple</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#36D068] mx-auto mb-2" />
                    <span>Loading discount details...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No matching discount records found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isCopied = copiedCode === item.coupon_code;
                  const mult = item.discount_total > 0 ? item.net_revenue / item.discount_total : 0;

                  return (
                    <tr
                      key={item.discount_id || item.coupon_code}
                      className="hover:bg-slate-50/70 transition-colors text-slate-700"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.coupon_code}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(item.coupon_code)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="Copy coupon code"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {item.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        {item.redemptions.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {item.unique_customers.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-rose-600">
                        -{formatCurrency(item.discount_total, currency)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {formatCurrency(item.avg_discount, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(item.net_revenue, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {mult.toFixed(1)}x
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer Totals */}
            {filteredItems.length > 0 && !isLoading && (
              <tfoot>
                <tr className="bg-slate-50/90 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                  <td className="py-3.5 px-4 uppercase tracking-wider" colSpan={3}>
                    Total ({filteredItems.length} coupons)
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {filteredItems.reduce((acc, i) => acc + (i.redemptions || 0), 0).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {filteredItems.reduce((acc, i) => acc + (i.unique_customers || 0), 0).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-rose-600">
                    -{formatCurrency(summary.totalDiscountAmount, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {formatCurrency(summary.avgDiscountOverall, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">
                    {formatCurrency(summary.totalNetRevenue, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                    {summary.overallMultiplier.toFixed(1)}x
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ─── Financial Guidance & Explanations ─── */}
      <div className="bg-gradient-to-r from-emerald-50/50 via-slate-50 to-rose-50/50 border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#36D068]" />
          Understanding Discount Analytics & ROI
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed mt-3">
          <div className="space-y-1">
            <strong className="text-slate-800 block">Paid Invoice Tracking</strong>
            <span>
              Metrics only evaluate discounts redeemed on successfully <strong>PAID invoices</strong> within the selected
              period, excluding unpaid or pending orders.
            </span>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">Net Revenue Impact</strong>
            <span>
              Shows the actual net cash captured on discounted checkouts after promo deductions, measuring real
              revenue generated by marketing campaigns.
            </span>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">Yield Multiplier</strong>
            <span>
              Calculated as <code>Net Revenue / Total Discount</code>. A higher ratio indicates more efficient promotional
              incentives that drive revenue without excessive subsidy.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

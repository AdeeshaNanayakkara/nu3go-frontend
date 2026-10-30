"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DollarSign,
  Receipt,
  CreditCard,
  TrendingUp,
  Calendar,
  CalendarRange,
  RefreshCw,
  Minus,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  analyticsService,
  type SalesSummaryRes,
  type AnalyticsStatCard,
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

function renderTrendBadge(card?: AnalyticsStatCard) {
  if (!card) return null;
  const { change_pct, trend } = card;

  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        <ArrowUpRight className="w-3.5 h-3.5" />
        <span>+{change_pct != null ? change_pct.toFixed(1) : "0.0"}%</span>
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
        <ArrowDownRight className="w-3.5 h-3.5" />
        <span>{change_pct != null ? change_pct.toFixed(1) : "0.0"}%</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" />
      <span>{change_pct != null ? `${change_pct.toFixed(1)}%` : "0%"}</span>
    </span>
  );
}

export function SalesOverviewSummary() {
  const [preset, setPreset] = useState<DatePreset>("30d");

  // Custom date bounds (default to last 30 days)
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  const [data, setData] = useState<SalesSummaryRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchSalesSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getSalesSummary({
        from: fromDate,
        to: toDate,
      });
      setData(result);
    } catch (err: unknown) {
      console.warn("[SalesOverviewSummary] Error loading sales summary:", err);
      setError("Unable to load sales summary analytics. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSalesSummary();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchSalesSummary]);

  const currency = data?.currency || "LKR";

  const comparisonRows = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Gross Revenue",
        desc: "Total invoiced before discount deductions",
        current: formatCurrency(data.gross_revenue?.value, currency),
        previous: formatCurrency(data.gross_revenue?.previous_value, currency),
        card: data.gross_revenue,
      },
      {
        label: "Net Revenue",
        desc: "Recognized sales after promo codes & coupons",
        current: formatCurrency(data.net_revenue?.value, currency),
        previous: formatCurrency(data.net_revenue?.previous_value, currency),
        card: data.net_revenue,
      },
      {
        label: "Cash Collected",
        desc: "Actual funds deposited (net minus wallet credit)",
        current: formatCurrency(data.cash_collected?.value, currency),
        previous: formatCurrency(data.cash_collected?.previous_value, currency),
        card: data.cash_collected,
      },
      {
        label: "Monthly Recurring Revenue (MRR)",
        desc: "Monthly-normalized fixed subscription price",
        current: formatCurrency(data.mrr?.value, currency),
        previous: formatCurrency(data.mrr?.previous_value, currency),
        card: data.mrr,
      },
      {
        label: "Average Revenue Per User (ARPU)",
        desc: "Average recognized revenue per active customer",
        current: formatCurrency(data.arpu?.value, currency),
        previous: formatCurrency(data.arpu?.previous_value, currency),
        card: data.arpu,
      },
      {
        label: "Average Invoice Value",
        desc: "Mean transaction ticket size on paid invoices",
        current: formatCurrency(data.avg_invoice_value?.value, currency),
        previous: formatCurrency(data.avg_invoice_value?.previous_value, currency),
        card: data.avg_invoice_value,
      },
      {
        label: "Paid Invoices",
        desc: "Total completed invoice transactions",
        current: (data.paid_invoices?.value ?? 0).toLocaleString(),
        previous: (data.paid_invoices?.previous_value ?? 0).toLocaleString(),
        card: data.paid_invoices,
      },
      {
        label: "Discounts Given",
        desc: "Total promotional discount deductions",
        current: formatCurrency(data.discounts_given?.value, currency),
        previous: formatCurrency(data.discounts_given?.previous_value, currency),
        card: data.discounts_given,
      },
      {
        label: "Wallet Credit Used",
        desc: "Customer store balance redeemed against invoices",
        current: formatCurrency(data.wallet_credit_used?.value, currency),
        previous: formatCurrency(data.wallet_credit_used?.previous_value, currency),
        card: data.wallet_credit_used,
      },
      {
        label: "Refunds Issued",
        desc: "Wallet credits credited back from meal cancellations",
        current: formatCurrency(data.refunds_issued?.value, currency),
        previous: formatCurrency(data.refunds_issued?.previous_value, currency),
        card: data.refunds_issued,
      },
      {
        label: "Renewal Success Rate",
        desc: "Percentage of subscriptions renewing without payment failure",
        current: `${(data.renewal_success_rate_pct?.value ?? 0).toFixed(1)}%`,
        previous: `${(data.renewal_success_rate_pct?.previous_value ?? 0).toFixed(1)}%`,
        card: data.renewal_success_rate_pct,
      },
    ];
  }, [data, currency]);

  return (
    <div className="space-y-6">
      {/* ─── Filter Banner ─── */}
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

            <button
              type="button"
              onClick={fetchSalesSummary}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 border border-slate-200 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#36D068]" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Date Window info bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-[#36D068]" />
            <span>
              Recognizing sales from{" "}
              <strong className="text-slate-800 font-semibold">
                {formatDateDisplay(data?.range?.from || fromDate)}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-800 font-semibold">
                {formatDateDisplay(data?.range?.to || toDate)}
              </strong>
            </span>
          </div>

          {data?.range?.previous_from && data?.range?.previous_to && (
            <div className="text-slate-400">
              Compared with previous period: {formatDateDisplay(data.range.previous_from)} to {formatDateDisplay(data.range.previous_to)}
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-sm">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchSalesSummary}
            className="text-xs font-bold underline hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Hero Key Metrics Grid (4 Top Primary Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:border-[#36D068]/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Gross Revenue
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#36D068]/15 text-[#36D068] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-oswald tracking-tight">
            {isLoading ? "—" : formatCurrency(data?.gross_revenue?.value, currency)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">vs prev period</span>
            {renderTrendBadge(data?.gross_revenue)}
          </div>
        </div>

        {/* Net Revenue */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Revenue
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#36D068] font-oswald tracking-tight">
            {isLoading ? "—" : formatCurrency(data?.net_revenue?.value, currency)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">After promo discounts</span>
            {renderTrendBadge(data?.net_revenue)}
          </div>
        </div>

        {/* Cash Collected */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:border-blue-400/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cash Collected
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-oswald tracking-tight">
            {isLoading ? "—" : formatCurrency(data?.cash_collected?.value, currency)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">Bank / Payment gateway</span>
            {renderTrendBadge(data?.cash_collected)}
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm relative overflow-hidden group hover:border-purple-400/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Recurring (MRR)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-oswald tracking-tight">
            {isLoading ? "—" : formatCurrency(data?.mrr?.value, currency)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">Active fixed subscriptions</span>
            {renderTrendBadge(data?.mrr)}
          </div>
        </div>
      </div>

      {/* ─── Secondary Metrics Grid (6 Secondary Cards) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* ARPU */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">ARPU</div>
          <div className="text-xl font-extrabold text-slate-900 font-oswald mt-1">
            {isLoading ? "—" : formatCurrency(data?.arpu?.value, currency)}
          </div>
          <div className="mt-1">{renderTrendBadge(data?.arpu)}</div>
        </div>

        {/* Avg Invoice Value */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Avg Ticket Size</div>
          <div className="text-xl font-extrabold text-slate-900 font-oswald mt-1">
            {isLoading ? "—" : formatCurrency(data?.avg_invoice_value?.value, currency)}
          </div>
          <div className="mt-1">{renderTrendBadge(data?.avg_invoice_value)}</div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Paid Invoices</div>
          <div className="text-xl font-extrabold text-slate-900 font-oswald mt-1">
            {isLoading ? "—" : (data?.paid_invoices?.value ?? 0).toLocaleString()}
          </div>
          <div className="mt-1">{renderTrendBadge(data?.paid_invoices)}</div>
        </div>

        {/* Renewal Success Rate */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Renewal Success</div>
          <div className="text-xl font-extrabold text-[#36D068] font-oswald mt-1">
            {isLoading ? "—" : `${(data?.renewal_success_rate_pct?.value ?? 0).toFixed(1)}%`}
          </div>
          <div className="mt-1">{renderTrendBadge(data?.renewal_success_rate_pct)}</div>
        </div>

        {/* Discounts Given */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Discounts Given</div>
          <div className="text-xl font-extrabold text-amber-600 font-oswald mt-1">
            {isLoading ? "—" : formatCurrency(data?.discounts_given?.value, currency)}
          </div>
          <div className="mt-1">{renderTrendBadge(data?.discounts_given)}</div>
        </div>

        {/* Refunds Issued */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Refunds Issued</div>
          <div className="text-xl font-extrabold text-rose-600 font-oswald mt-1">
            {isLoading ? "—" : formatCurrency(data?.refunds_issued?.value, currency)}
          </div>
          <div className="mt-1">{renderTrendBadge(data?.refunds_issued)}</div>
        </div>
      </div>

      {/* ─── Period-Over-Period Financial Ledger Table ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Period-Over-Period Performance Breakdown</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side metric comparison between current window and previous window of equal length.
          </p>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-4 rounded-l-xl">Revenue Metric</th>
                <th className="py-3.5 px-4 text-right">Current Period</th>
                <th className="py-3.5 px-4 text-right">Previous Period</th>
                <th className="py-3.5 px-4 text-right">Variance</th>
                <th className="py-3.5 px-4 rounded-r-xl text-center">Trend Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    Loading financial performance...
                  </td>
                </tr>
              ) : comparisonRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    No data recorded for this period.
                  </td>
                </tr>
              ) : (
                comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{row.label}</div>
                      <div className="text-xs text-slate-400">{row.desc}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 font-oswald text-base">
                      {row.current}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                      {row.previous}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs font-bold">
                      {row.card?.change_pct != null ? `${row.card.change_pct > 0 ? "+" : ""}${row.card.change_pct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderTrendBadge(row.card)}
                    </td>
                  </tr>
                ))
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
            <div className="font-semibold text-white">Revenue Recognition Protocol</div>
            <div className="text-slate-400 text-xs mt-0.5">
              Sales revenue is recognised strictly on PAID invoices by paid date. Wallet credits from meal cancellations offset future billing without creating external bank fees.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


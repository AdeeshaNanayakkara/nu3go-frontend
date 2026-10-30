"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CreditCard,
  RefreshCw,
  Calendar,
  CalendarRange,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Repeat,
  Info,
  Activity,
  ShieldCheck,
} from "lucide-react";
import {
  analyticsService,
  type SalesPaymentsRes,
  type FailureReasonRes,
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

export function SalesPaymentsView() {
  const [preset, setPreset] = useState<DatePreset>("30d");

  // Custom date bounds (default to last 30 days)
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYMD(d);
  });
  const [toDate, setToDate] = useState<string>(() => formatYMD(new Date()));

  // Data states
  const [data, setData] = useState<SalesPaymentsRes | null>(null);
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

  // Main data fetch from /api/v1/analytics/sales/payments
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getSalesPayments({
        from: fromDate,
        to: toDate,
      });
      setData(res);
    } catch (err) {
      console.error("[SalesPaymentsView] fetch error:", err);
      setError("Failed to fetch payment health analytics. Please try again.");
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
  const checkout = data?.checkout;
  const renewals = data?.renewals;
  const atRisk = data?.at_risk;
  const failureReasons: FailureReasonRes[] = useMemo(() => data?.top_failure_reasons || [], [data]);

  // Max failure reason count for horizontal bar scaling
  const maxFailureCount = useMemo(() => {
    if (failureReasons.length === 0) return 1;
    const maxVal = Math.max(...failureReasons.map((r) => r.count || 0));
    return maxVal > 0 ? maxVal : 1;
  }, [failureReasons]);

  // Total failures from the failure reasons list
  const totalFailureReasonsCount = useMemo(() => {
    return failureReasons.reduce((acc, r) => acc + (r.count || 0), 0);
  }, [failureReasons]);

  return (
    <div className="space-y-6">
      {/* ─── Control Bar ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Section Title Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#36D068] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Payment Gateway & Billing Health</h2>
            <p className="text-xs text-slate-500">Checkout conversion, recurring renewals, and dunning</p>
          </div>
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
            title="Refresh payment health"
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
            Payment telemetry from{" "}
            <strong className="text-slate-700 font-semibold">{formatDateDisplay(fromDate)}</strong> to{" "}
            <strong className="text-slate-700 font-semibold">{formatDateDisplay(toDate)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Currency: <span className="text-slate-900">{currency}</span>
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full border ${
              (atRisk?.subscriptions || 0) > 0
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            At-Risk Subscriptions: <span className="font-bold">{atRisk?.subscriptions ?? 0}</span>
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

      {/* ─── High Priority At-Risk Alert Banner (if subscriptions are in PAYMENT_FAILED) ─── */}
      {!isLoading && (atRisk?.subscriptions || 0) > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border border-amber-300/80 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>Revenue at Risk: {atRisk?.subscriptions} Subscriptions in Payment Failed</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] uppercase font-bold">
                  Action Required
                </span>
              </h3>
              <p className="text-xs text-amber-900/80 mt-0.5">
                Total monthly recurring revenue (MRR) currently stalled:{" "}
                <strong className="text-amber-950 font-bold">{formatCurrency(atRisk?.monthly_value, currency)}</strong>.
                Customers are in dunning retry cycle or require an updated payment method.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Aggregate KPI Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Checkout Success Rate */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Checkout Success</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#36D068] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900 flex items-baseline gap-1.5">
            <span>{isLoading ? "—" : `${(checkout?.success_rate_pct ?? 0).toFixed(1)}%`}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>
              {checkout?.success ?? 0} of {checkout?.total ?? 0} initial checkouts succeeded
            </span>
          </div>
        </div>

        {/* Recurring Renewal Success Rate */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Renewal Success</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900 flex items-baseline gap-1.5">
            <span>{isLoading ? "—" : `${(renewals?.success_rate_pct ?? 0).toFixed(1)}%`}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>
              {renewals?.successes ?? 0} of {renewals?.attempts ?? 0} renewals billed
            </span>
          </div>
        </div>

        {/* At-Risk Subscriptions Count */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">At-Risk Plans</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : (atRisk?.subscriptions ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>Active subs in PAYMENT_FAILED</span>
          </div>
        </div>

        {/* At-Risk Monthly Revenue Value */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">At-Risk MRR</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-rose-600">
            {isLoading ? "—" : formatCurrency(atRisk?.monthly_value, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Uncollected monthly renewal value</span>
          </div>
        </div>
      </div>

      {/* ─── Funnel Panels: First-Time Checkouts vs Recurring Renewals ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checkout Health Panel */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#36D068]" />
                  <span>First-Checkout Payment Funnel</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Initial customer subscription purchases during onboarding
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {(checkout?.success_rate_pct ?? 0).toFixed(1)}% Conversion
              </span>
            </div>

            {/* Tri-Color Funnel Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex my-4">
              <div
                className="bg-[#36D068] h-full transition-all duration-500"
                style={{
                  width: `${
                    (checkout?.total ?? 0) > 0
                      ? ((checkout?.success ?? 0) / (checkout?.total ?? 1)) * 100
                      : 0
                  }%`,
                }}
                title={`Success: ${checkout?.success ?? 0}`}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{
                  width: `${
                    (checkout?.total ?? 0) > 0
                      ? ((checkout?.pending ?? 0) / (checkout?.total ?? 1)) * 100
                      : 0
                  }%`,
                }}
                title={`Pending: ${checkout?.pending ?? 0}`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{
                  width: `${
                    (checkout?.total ?? 0) > 0
                      ? ((checkout?.failed ?? 0) / (checkout?.total ?? 1)) * 100
                      : 0
                  }%`,
                }}
                title={`Failed: ${checkout?.failed ?? 0}`}
              />
            </div>

            {/* Funnel Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center mt-5">
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Success</span>
                </div>
                <div className="text-lg font-bold font-oswald text-slate-900">
                  {checkout?.success ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {(checkout?.total ?? 0) > 0
                    ? `${(((checkout?.success ?? 0) / (checkout?.total ?? 1)) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center justify-center gap-1 text-amber-700 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
                </div>
                <div className="text-lg font-bold font-oswald text-slate-900">
                  {checkout?.pending ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {(checkout?.total ?? 0) > 0
                    ? `${(((checkout?.pending ?? 0) / (checkout?.total ?? 1)) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
                <div className="flex items-center justify-center gap-1 text-rose-700 mb-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Failed</span>
                </div>
                <div className="text-lg font-bold font-oswald text-slate-900">
                  {checkout?.failed ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {(checkout?.total ?? 0) > 0
                    ? `${(((checkout?.failed ?? 0) / (checkout?.total ?? 1)) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Checkouts Processed:</span>
            <strong className="text-slate-900 font-bold">{checkout?.total ?? 0} attempts</strong>
          </div>
        </div>

        {/* Recurring Renewals Panel */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-blue-600" />
                  <span>Recurring Billing & Renewal Health</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated background charges on active ongoing subscriptions
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {(renewals?.success_rate_pct ?? 0).toFixed(1)}% Success
              </span>
            </div>

            {/* Dual Color Renewal Bar */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex my-4">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{
                  width: `${
                    (renewals?.attempts ?? 0) > 0
                      ? ((renewals?.successes ?? 0) / (renewals?.attempts ?? 1)) * 100
                      : 0
                  }%`,
                }}
                title={`Successes: ${renewals?.successes ?? 0}`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{
                  width: `${
                    (renewals?.attempts ?? 0) > 0
                      ? ((renewals?.failures ?? 0) / (renewals?.attempts ?? 1)) * 100
                      : 0
                  }%`,
                }}
                title={`Failures: ${renewals?.failures ?? 0}`}
              />
            </div>

            {/* Renewal Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-4 text-center mt-5">
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center justify-center gap-1 text-blue-700 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Successes</span>
                </div>
                <div className="text-xl font-bold font-oswald text-slate-900">
                  {renewals?.successes ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {(renewals?.attempts ?? 0) > 0
                    ? `${(((renewals?.successes ?? 0) / (renewals?.attempts ?? 1)) * 100).toFixed(1)}% of attempts`
                    : "0%"}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
                <div className="flex items-center justify-center gap-1 text-rose-700 mb-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Failures</span>
                </div>
                <div className="text-xl font-bold font-oswald text-rose-700">
                  {renewals?.failures ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {(renewals?.attempts ?? 0) > 0
                    ? `${(((renewals?.failures ?? 0) / (renewals?.attempts ?? 1)) * 100).toFixed(1)}% of attempts`
                    : "0%"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Renewal Invoices Attempted:</span>
            <strong className="text-slate-900 font-bold">{renewals?.attempts ?? 0} attempts</strong>
          </div>
        </div>
      </div>

      {/* ─── Top Recurring Failure Reasons ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Top Recurring Failure Reasons</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Root causes for automated renewal payment declines reported by gateway webhooks.
            </p>
          </div>
          <span className="text-xs text-slate-500 self-start sm:self-auto font-medium">
            Total Logged Failures: <strong className="text-slate-800">{totalFailureReasonsCount}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#36D068]" />
            <span className="text-sm font-medium">Analyzing gateway telemetry...</span>
          </div>
        ) : failureReasons.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-slate-700">Zero Recurring Failures Recorded</p>
            <p className="text-xs text-slate-400 mt-1">
              All automated subscription renewal billing charges were processed without errors in this range.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {failureReasons.map((item, idx) => {
              const countPct = Math.min(100, (item.count / maxFailureCount) * 100);
              const shareOfTotal =
                totalFailureReasonsCount > 0 ? (item.count / totalFailureReasonsCount) * 100 : 0;

              return (
                <div
                  key={item.reason || idx}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{item.reason}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                        {item.count} {item.count === 1 ? "failure" : "failures"}
                      </span>
                      <span className="text-slate-500 font-semibold">
                        {shareOfTotal.toFixed(1)}% of issues
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(countPct, 4)}%` }}
                      title={`${item.count} failures (${shareOfTotal.toFixed(1)}%)`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Financial Guidance & Dunning Workflow ─── */}
      <div className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-amber-50/50 border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600" />
          Understanding Payment Health & Dunning Operations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed mt-3">
          <div className="space-y-1">
            <strong className="text-slate-800 block">First Checkout vs Renewal</strong>
            <span>
              <strong>First Checkout</strong> reflects upfront transactions entered manually by customers during signup.
              <strong> Renewal Health</strong> measures automated recurring payment attempts on stored tokens.
            </span>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">At-Risk Subscription Handling</strong>
            <span>
              Subscriptions enter <code>PAYMENT_FAILED</code> after all retry attempts are exhausted. Nu3Go pauses deliveries
              until the subscriber updates their card details or re-authenticates.
            </span>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">Dunning & Recovery Rate</strong>
            <span>
              Over 70% of payment failures are due to transient causes (insufficient funds, temporary bank holds).
              Automated smart retries staggered over 24-72 hours recover the majority of at-risk MRR.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

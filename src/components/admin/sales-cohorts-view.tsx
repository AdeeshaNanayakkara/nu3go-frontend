"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  Info,
  Sparkles,
  Percent,
  Layers,
} from "lucide-react";
import {
  analyticsService,
  type SalesCohortsRes,
  type CohortRowRes,
  type CohortPeriodRes,
} from "@/services/api/analytics.service";

type MetricView = "retention" | "customers" | "revenue";

function formatMonthLabel(ym: string): string {
  if (!ym) return "—";
  try {
    const parts = ym.split("-");
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const d = new Date(year, monthIndex, 1);
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    return ym;
  } catch {
    return ym;
  }
}

function formatCurrency(val?: number, currency = "LKR"): string {
  if (val === undefined || val === null || isNaN(val)) return "—";
  return `${currency} ${val.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function SalesCohortsView() {
  const [months, setMonths] = useState<number>(6);
  const [metricView, setMetricView] = useState<MetricView>("retention");

  // Data states
  const [data, setData] = useState<SalesCohortsRes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hover state for interactive matrix inspection
  const [hoveredCell, setHoveredCell] = useState<{
    cohort: string;
    period: CohortPeriodRes;
    baseCustomers: number;
  } | null>(null);

  // Main data fetch from /api/v1/analytics/sales/cohorts
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getSalesCohorts({ months });
      setData(res);
    } catch (err) {
      console.error("[SalesCohortsView] fetch error:", err);
      setError("Failed to fetch retention cohorts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [months]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const currency = data?.currency || "LKR";
  const cohorts: CohortRowRes[] = useMemo(() => data?.cohorts || [], [data]);

  // Determine max offset columns across all cohorts
  const maxOffset = useMemo(() => {
    let max = 0;
    for (const c of cohorts) {
      for (const p of c.periods || []) {
        if (p.offset > max) max = p.offset;
      }
    }
    return max;
  }, [cohorts]);

  // Offsets list: [0, 1, 2, ..., maxOffset]
  const offsetList = useMemo(() => {
    return Array.from({ length: maxOffset + 1 }, (_, i) => i);
  }, [maxOffset]);

  // Aggregate KPI Calculations
  const summary = useMemo(() => {
    let totalAcquired = 0;
    let totalLifetimeRevenue = 0;

    const m1RetentionValues: number[] = [];
    const m3RetentionValues: number[] = [];

    for (const c of cohorts) {
      totalAcquired += c.customers || 0;
      for (const p of c.periods || []) {
        totalLifetimeRevenue += p.revenue || 0;
        if (p.offset === 1 && p.retention_pct != null) {
          m1RetentionValues.push(p.retention_pct);
        }
        if (p.offset === 3 && p.retention_pct != null) {
          m3RetentionValues.push(p.retention_pct);
        }
      }
    }

    const avgM1Retention =
      m1RetentionValues.length > 0
        ? m1RetentionValues.reduce((a, b) => a + b, 0) / m1RetentionValues.length
        : 0;
    const avgM3Retention =
      m3RetentionValues.length > 0
        ? m3RetentionValues.reduce((a, b) => a + b, 0) / m3RetentionValues.length
        : 0;

    return {
      totalAcquired,
      totalLifetimeRevenue,
      avgM1Retention,
      avgM3Retention,
    };
  }, [cohorts]);

  // Calculate overall average retention per offset column
  const averageByOffset = useMemo(() => {
    return offsetList.map((offset) => {
      const vals: number[] = [];
      let totalRev = 0;
      let totalActive = 0;

      for (const c of cohorts) {
        const match = c.periods?.find((p) => p.offset === offset);
        if (match) {
          if (match.retention_pct != null) vals.push(match.retention_pct);
          totalRev += match.revenue || 0;
          totalActive += match.active_customers || 0;
        }
      }

      const avgPct = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return {
        offset,
        avgPct,
        totalRev,
        totalActive,
        count: vals.length,
      };
    });
  }, [cohorts, offsetList]);

  // Cell heatmap color calculation based on retention %
  const getCellBgClass = (pct: number) => {
    if (pct >= 85) return "bg-emerald-100 text-emerald-900 font-bold";
    if (pct >= 70) return "bg-emerald-50 text-emerald-800 font-semibold";
    if (pct >= 50) return "bg-amber-50 text-amber-900 font-medium";
    if (pct >= 30) return "bg-slate-100 text-slate-800 font-medium";
    return "bg-slate-50 text-slate-500";
  };

  // Export CSV handler
  const handleExportCSV = () => {
    if (cohorts.length === 0) return;
    const headers = [
      "Cohort",
      "Acquired Users",
      ...offsetList.map((o) => `Month ${o} Retention %`),
      ...offsetList.map((o) => `Month ${o} Revenue (${currency})`),
    ];

    const rows = cohorts.map((c) => {
      const retentionVals = offsetList.map((o) => {
        const p = c.periods?.find((item) => item.offset === o);
        return p ? `${p.retention_pct.toFixed(1)}%` : "";
      });
      const revenueVals = offsetList.map((o) => {
        const p = c.periods?.find((item) => item.offset === o);
        return p ? p.revenue : "";
      });
      return [c.cohort, c.customers, ...retentionVals, ...revenueVals];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_cohorts_${months}m.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* ─── Control Bar ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Metric View Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Display Metric:
          </span>
          {(
            [
              { id: "retention", label: "Retention Rate (%)" },
              { id: "customers", label: "Active Customers" },
              { id: "revenue", label: `Net Revenue (${currency})` },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetricView(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                metricView === m.id
                  ? "bg-[#36D068] text-white shadow-xs font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Right: Months Range Selector & Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Range:
          </span>
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
            {[3, 6, 9, 12].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMonths(num)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  months === num
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {num} Months
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-2xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Refresh cohort analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#36D068]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Active Range & Currency Indicator ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 px-1 gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Tracking customer cohort retention across the last{" "}
            <strong className="text-slate-700 font-semibold">{months} monthly signup cohorts</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Currency: <span className="text-slate-900">{currency}</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Cohorts: <span className="font-bold">{cohorts.length}</span>
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
        {/* Total Customers Acquired */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Acquired</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#36D068] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : summary.totalAcquired.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>New subscribers across {cohorts.length} cohorts</span>
          </div>
        </div>

        {/* Lifetime Cohort Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cohort Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : formatCurrency(summary.totalLifetimeRevenue, currency)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>Cumulative net revenue from these cohorts</span>
          </div>
        </div>

        {/* Avg Month 1 Retention */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Month 1 Retention</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : `${summary.avgM1Retention.toFixed(1)}%`}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>First recurring renewal benchmark</span>
          </div>
        </div>

        {/* Avg Month 3 Retention */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Month 3 Retention</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-oswald text-slate-900">
            {isLoading ? "—" : `${summary.avgM3Retention.toFixed(1)}%`}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>90-day subscription stickiness</span>
          </div>
        </div>
      </div>

      {/* ─── Cohort Retention Heatmap Matrix ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#36D068]" />
              <span>Revenue Retention Heatmap Matrix</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Percentage of customers and net revenue retained in each subsequent month following their first purchase.
            </p>
          </div>

          {/* Export to CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={cohorts.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-2xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Hover detail preview banner */}
        <div className="min-h-[42px] mb-4 bg-slate-50 border border-slate-200/70 rounded-2xl p-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
          {hoveredCell ? (
            <>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-slate-800">
                  Cohort {formatMonthLabel(hoveredCell.cohort)}
                </span>
                <span className="text-slate-400 font-bold">→</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  Month {hoveredCell.period.offset} (M+{hoveredCell.period.offset})
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-700">
                  Active Users:{" "}
                  <strong className="font-bold text-slate-900">
                    {hoveredCell.period.active_customers} / {hoveredCell.baseCustomers}
                  </strong>
                </span>
                <span className="text-emerald-700 font-bold">
                  Retention: {(hoveredCell.period.retention_pct ?? 0).toFixed(1)}%
                </span>
                <span className="text-blue-700 font-bold">
                  Net Revenue: {formatCurrency(hoveredCell.period.revenue, currency)}
                </span>
              </div>
            </>
          ) : (
            <span className="text-slate-400 italic flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Hover over any cell in the cohort matrix to inspect detailed customer count, retention %, and revenue.
            </span>
          )}
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3 px-4 min-w-[120px]">Cohort Month</th>
                <th className="py-3 px-4 text-center min-w-[90px]">Acquired (M0)</th>
                {offsetList.map((offset) => (
                  <th key={offset} className="py-3 px-3 text-center min-w-[70px]">
                    {offset === 0 ? "M0" : `M+${offset}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={offsetList.length + 2} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#36D068] mx-auto mb-2" />
                    <span>Calculating retention cohorts...</span>
                  </td>
                </tr>
              ) : cohorts.length === 0 ? (
                <tr>
                  <td colSpan={offsetList.length + 2} className="py-12 text-center text-slate-400">
                    No cohort records available for this range.
                  </td>
                </tr>
              ) : (
                cohorts.map((row) => (
                  <tr key={row.cohort} className="hover:bg-slate-50/50 transition-colors">
                    {/* Cohort Name */}
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {formatMonthLabel(row.cohort)}
                    </td>

                    {/* Acquired Base Users */}
                    <td className="py-3 px-4 text-center font-bold text-slate-800 bg-slate-50/70 border-r border-slate-100">
                      {row.customers.toLocaleString()}
                    </td>

                    {/* Offset Columns */}
                    {offsetList.map((offset) => {
                      const period = row.periods?.find((p) => p.offset === offset);
                      if (!period) {
                        return (
                          <td
                            key={offset}
                            className="py-2.5 px-2 text-center text-slate-200 bg-slate-50/20"
                          >
                            —
                          </td>
                        );
                      }

                      const retentionVal = period.retention_pct ?? 0;
                      const isHovered =
                        hoveredCell?.cohort === row.cohort &&
                        hoveredCell?.period.offset === offset;

                      return (
                        <td
                          key={offset}
                          className="py-2 px-1 text-center"
                          onMouseEnter={() =>
                            setHoveredCell({
                              cohort: row.cohort,
                              period,
                              baseCustomers: row.customers,
                            })
                          }
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <div
                            className={`py-2 px-1 rounded-xl transition-all cursor-pointer ${getCellBgClass(
                              retentionVal
                            )} ${isHovered ? "ring-2 ring-emerald-500 scale-105 shadow-xs" : ""}`}
                          >
                            {metricView === "retention" ? (
                              <span className="text-[11px] font-bold">
                                {retentionVal.toFixed(0)}%
                              </span>
                            ) : metricView === "customers" ? (
                              <span className="text-[11px] font-bold">
                                {period.active_customers}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold">
                                {formatCurrency(period.revenue, "")}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>

            {/* Average Retention Curve Footer Row */}
            {cohorts.length > 0 && !isLoading && (
              <tfoot>
                <tr className="bg-slate-50/95 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                  <td className="py-3.5 px-4 uppercase tracking-wider">Average Retention</td>
                  <td className="py-3.5 px-4 text-center text-slate-500 border-r border-slate-200">
                    —
                  </td>
                  {averageByOffset.map((col) => (
                    <td key={col.offset} className="py-3.5 px-1 text-center">
                      <span className="text-[11px] font-bold text-emerald-800">
                        {col.count > 0 ? `${col.avgPct.toFixed(0)}%` : "—"}
                      </span>
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ─── Retention Curve Decay Visualization ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#36D068]" />
          <span>Average Subscriber Retention Decay Curve</span>
        </h4>
        <p className="text-xs text-slate-500 mb-5">
          Benchmark curve showing the average percentage of customers who continue paying at each consecutive monthly renewal.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
          {averageByOffset.map((col) => (
            <div
              key={col.offset}
              className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700">
                  {col.offset === 0 ? "Month 0" : `Month +${col.offset}`}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {col.count} {col.count === 1 ? "cohort" : "cohorts"}
                </span>
              </div>
              <div className="text-xl font-bold font-oswald text-emerald-700 mb-2">
                {col.count > 0 ? `${col.avgPct.toFixed(1)}%` : "—"}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#36D068] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, col.avgPct))}%` }}
                />
              </div>

              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{formatCurrency(col.totalRev, currency)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Financial Guidance & Explanations ─── */}
      <div className="bg-gradient-to-r from-emerald-50/50 via-slate-50 to-indigo-50/50 border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-[#36D068]" />
          Interpreting Subscription Retention Cohorts
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed mt-3">
          <div className="space-y-1">
            <strong className="text-slate-800 block">Month 0 Baseline</strong>
            <span>
              <strong>M0</strong> represents the initial acquisition month when new subscribers paid their very first invoice.
              It is anchored at 100% as the baseline for all subsequent periods.
            </span>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">Retention Flattening & Product-Market Fit</strong>
            <span>
              A retention curve that flattens out (e.g. stabilizes above 50% from M+3 onward) demonstrates strong
              long-term product stickiness and healthy customer lifetime value (LTV).
            </span>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 block">Triangular Heatmap Pattern</strong>
            <span>
              Newer cohorts have fewer elapsed months and thus appear shorter in the table. Older cohorts show a longer
              historical trail of repeat renewal behavior.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

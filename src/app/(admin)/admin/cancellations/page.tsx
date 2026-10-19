"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CalendarX,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Ban,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import {
  mealCancellationService,
  type MealCancellationRes,
} from "@/services/api/meal-cancellation.service";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const clean = dateStr.split("T")[0];
    const parts = clean.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  } catch {
    return dateStr;
  }
}

export default function AdminCancellationsPage() {
  const [cancellations, setCancellations] = useState<MealCancellationRes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchSubscriptionId, setSearchSubscriptionId] = useState("");
  const [refundTierFilter, setRefundTierFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // "ALL" | "ACTIVE" | "REVERTED"
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Revert Modal State
  const [revertingItem, setRevertingItem] = useState<MealCancellationRes | null>(null);
  const [isReverting, setIsReverting] = useState(false);
  const [revertError, setRevertError] = useState<string | null>(null);

  const fetchCancellations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page,
        limit,
      };

      if (searchSubscriptionId.trim()) {
        params.subscription_id = searchSubscriptionId.trim();
      }
      if (refundTierFilter !== "ALL") {
        params.refund_tier = refundTierFilter;
      }
      if (statusFilter === "REVERTED") {
        params.is_reverted = true;
      } else if (statusFilter === "ACTIVE") {
        params.is_reverted = false;
      }
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const res = await mealCancellationService.getAllCancellations(params);
      setCancellations(res.data || []);
      setTotalItems(res.pagination?.total || (res.data ? res.data.length : 0));
      setTotalPages(res.pagination?.total_pages || Math.max(1, Math.ceil((res.pagination?.total || 0) / limit)));
    } catch (err: any) {
      console.error("[AdminCancellationsPage] Error loading cancellations:", err);
      setError(
        err?.message ||
        err?.response?.data?.message ||
        "Failed to load meal cancellations from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchSubscriptionId, refundTierFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchCancellations();
  }, [fetchCancellations]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCancellations();
  };

  const handleClearFilters = () => {
    setSearchSubscriptionId("");
    setRefundTierFilter("ALL");
    setStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // Confirm Revert Cancellation
  const handleConfirmRevert = async () => {
    if (!revertingItem) return;
    setIsReverting(true);
    setRevertError(null);

    try {
      await mealCancellationService.revertCancellation(revertingItem.id);
      setSuccessMessage(
        `Meal delivery for ${formatDate(revertingItem.delivery_date)} has been restored (cancellation reverted).`
      );
      setRevertingItem(null);
      await fetchCancellations();
    } catch (err: any) {
      console.error("[AdminCancellationsPage] Revert error:", err);
      setRevertError(
        err?.message ||
        err?.response?.data?.message ||
        "Failed to revert cancellation. Please try again."
      );
    } finally {
      setIsReverting(false);
    }
  };

  // Aggregated Stats
  const activeCount = cancellations.filter((c) => !c.reverted_at).length;
  const revertedCount = cancellations.filter((c) => Boolean(c.reverted_at)).length;
  const totalRefundAmount = cancellations.reduce(
    (sum, c) => sum + (typeof c.refund_amount === "number" ? c.refund_amount : 0),
    0
  );

  return (
    <div className="space-y-8 font-poppins">
      {/* ─── Header Banner ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-50 text-rose-600 border border-rose-200/70 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <CalendarX className="w-3.5 h-3.5" />
              Meal Cancellations Hub
            </span>
            <span className="text-slate-500 text-xs font-medium">
              API: /api/v1/meal-cancellations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Meal Cancellations & Skips
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review customer cancellation requests, reasons, refund tiers, and restore deliveries when needed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCancellations}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            title="Refresh Cancellations"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#36D068]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Success Feedback Alert ─── */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Error Alert ─── */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-700 hover:text-rose-900 p-1 rounded-lg hover:bg-rose-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Metric KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Listed */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Total Cancellations
            </span>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <CalendarX className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-slate-900 block font-oswald tracking-tight">
              {totalItems.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Recorded in system
            </span>
          </div>
        </div>

        {/* Active Skips */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Active Meal Skips
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Ban className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-rose-600 block font-oswald tracking-tight">
              {activeCount}
            </span>
            <span className="text-xs text-rose-600/80 font-medium">
              Kitchen prep skipped
            </span>
          </div>
        </div>

        {/* Reverted */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Reverted / Restored
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-blue-600 block font-oswald tracking-tight">
              {revertedCount}
            </span>
            <span className="text-xs text-blue-600/80 font-medium">
              Deliveries reinstated
            </span>
          </div>
        </div>

        {/* Total Refund Value */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Current Page Refunds
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#15803D] border border-emerald-100">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-neutral-900 block font-oswald tracking-tight">
              LKR {totalRefundAmount.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              Customer credits logged
            </span>
          </div>
        </div>
      </div>

      {/* ─── Search and Filter Controls ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Subscription ID Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchSubscriptionId}
              onChange={(e) => setSearchSubscriptionId(e.target.value)}
              placeholder="Search by Subscription ID (e.g. 123e4567...)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-neutral-900 focus:outline-hidden transition-all"
            />
          </div>

          {/* Refund Tier Filter */}
          <div className="flex items-center gap-2">
            <select
              value={refundTierFilter}
              onChange={(e) => {
                setRefundTierFilter(e.target.value);
                setPage(1);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:bg-white focus:border-neutral-900 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Refund Tiers</option>
              <option value="FULL_REFUND">Full Refund</option>
              <option value="PARTIAL_REFUND">Partial Refund</option>
              <option value="NO_REFUND">No Refund</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:bg-white focus:border-neutral-900 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Skips</option>
              <option value="REVERTED">Reverted</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-oswald font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* ─── Cancellations Table ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Meal Cancellations</h2>
            <p className="text-xs text-slate-500">
              Showing page {page} of {totalPages} ({totalItems} total requests)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">Delivery Date</th>
                <th className="py-3.5 px-4">Subscription ID</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Refund Tier / Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Cancelled At</th>
                <th className="py-3.5 px-4 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#36D068]" />
                    <span className="text-xs font-medium">Fetching cancellations from server...</span>
                  </td>
                </tr>
              ) : cancellations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CalendarX className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <span className="text-sm font-semibold text-slate-700 block">
                      No meal cancellations found
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">
                      Customer cancellation requests submitted via /api/v1/meal-cancellations will appear here.
                    </span>
                  </td>
                </tr>
              ) : (
                cancellations.map((item) => {
                  const isReverted = Boolean(item.reverted_at);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Delivery Date */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                          <span className="font-oswald uppercase tracking-wide">
                            {formatDate(item.delivery_date)}
                          </span>
                        </div>
                      </td>

                      {/* Subscription ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          {item.subscription_id ? `${item.subscription_id.slice(0, 12)}...` : "—"}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg block max-w-xs truncate" title={item.reason}>
                          "{item.reason || "Customer cancelled delivery"}"
                        </span>
                      </td>

                      {/* Refund Tier & Amount */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-oswald font-bold uppercase tracking-wider ${
                              item.refund_tier === "FULL_REFUND"
                                ? "bg-emerald-100 text-[#15803D]"
                                : item.refund_tier === "PARTIAL_REFUND"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.refund_tier || "Standard Tier"}
                          </span>
                          {typeof item.refund_amount === "number" && item.refund_amount > 0 && (
                            <span className="text-xs font-semibold text-neutral-900 block">
                              LKR {item.refund_amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isReverted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <RotateCcw className="w-3 h-3" /> Reverted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <Ban className="w-3 h-3" /> Cancelled
                          </span>
                        )}
                      </td>

                      {/* Cancelled At */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDateTime(item.created_at)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {!isReverted ? (
                          <button
                            type="button"
                            onClick={() => setRevertingItem(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-neutral-900 text-xs font-oswald font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="Revert cancellation and restore delivery"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                            <span>Revert</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Restored
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

        {/* ─── Pagination Controls ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            Page {page} of {totalPages} ({totalItems} total items)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 text-xs font-medium transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-semibold px-2 text-slate-700">
              {page}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 text-xs font-medium transition-colors cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Revert Confirmation Modal ─── */}
      {revertingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150 font-poppins">
          <div
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-oswald font-bold uppercase text-neutral-900 tracking-tight">
                Revert Meal Cancellation?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will restore the meal delivery for{" "}
                <strong className="text-neutral-900 font-semibold">
                  {formatDate(revertingItem.delivery_date)}
                </strong>
                . Kitchen preparation and delivery scheduling will be re-enabled.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 mt-2 space-y-1">
                <p><strong>Subscription:</strong> {revertingItem.subscription_id}</p>
                <p><strong>Reason:</strong> {revertingItem.reason}</p>
              </div>
            </div>

            {revertError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{revertError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isReverting}
                onClick={() => {
                  setRevertingItem(null);
                  setRevertError(null);
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-oswald font-bold uppercase tracking-wider rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isReverting}
                onClick={handleConfirmRevert}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-oswald text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                {isReverting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reverting...</span>
                  </>
                ) : (
                  <span>Confirm Revert</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Truck,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckSquare,
  Square,
  Check,
  Loader2,
  CheckCheck,
  Printer,
  PieChart,
  CalendarClock,
  TrendingUp,
  UtensilsCrossed,
  Layers,
} from "lucide-react";
import {
  deliveryService,
  type DeliveryListItem,
  type DeliveryPaginationMeta,
} from "@/services/api/delivery.service";
import { formatUserFriendlyError } from "@/utils/response-handler";
import { DeliveryPdfModal } from "@/components/admin/delivery-pdf-modal";
import { DeliveryOverviewSummary } from "@/components/admin/delivery-overview-summary";
import { DeliveryForecastView } from "@/components/admin/delivery-forecast-view";
import { DeliveryTrendView } from "@/components/admin/delivery-trend-view";
import { DeliveryBreakdownView } from "@/components/admin/delivery-breakdown-view";
import { DeliveryOptionalMealsView } from "@/components/admin/delivery-optional-meals-view";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateHeader(ymd: string): string {
  try {
    const parts = ymd.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString("en-US", {
        weekday: "long",
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

function formatTime(isoStr?: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

function AdminDeliveriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewQuery = searchParams?.get("view");
  const activeView =
    viewQuery === "forecast"
      ? "forecast"
      : viewQuery === "trend"
      ? "trend"
      : viewQuery === "breakdown"
      ? "breakdown"
      : viewQuery === "optional-meals"
      ? "optional-meals"
      : viewQuery === "deliveries"
      ? "deliveries"
      : "overview";

  // Selected Delivery Date (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(() => formatYMD(new Date()));

  // Deliveries data
  const [deliveries, setDeliveries] = useState<DeliveryListItem[]>([]);
  const [pagination, setPagination] = useState<DeliveryPaginationMeta>({
    page: 1,
    limit: 10,
    total_pages: 1,
    total_rows: 0,
    has_next: false,
    has_prev: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DELIVERED" | "PENDING">("ALL");
  const [planFilter, setPlanFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Selection for Batch Mark
  const [selectedSubscriptionIds, setSelectedSubscriptionIds] = useState<string[]>([]);
  const [isBatchMarking, setIsBatchMarking] = useState<boolean>(false);

  // Single Action Loading state: item ID being marked or undone
  const [processingSubId, setProcessingSubId] = useState<string | null>(null);

  // Undo Modal State
  const [undoModalItem, setUndoModalItem] = useState<DeliveryListItem | null>(null);
  const [isUndoing, setIsUndoing] = useState<boolean>(false);

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // System Toast / Alert Feedback
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  }, []);

  // Fetch Deliveries
  const fetchDeliveries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedSubscriptionIds([]);
    try {
      const res = await deliveryService.getDeliveries({
        date: selectedDate,
        page,
        limit,
      });

      if (res) {
        setDeliveries(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        } else {
          setPagination({
            page,
            limit,
            total_pages: 1,
            total_rows: res.data?.length || 0,
            has_next: false,
            has_prev: false,
          });
        }
      } else {
        setDeliveries([]);
      }
    } catch (err: unknown) {
      console.error("[AdminDeliveriesPage] Error fetching deliveries:", err);
      setError("Unable to load deliveries for this date. Please verify your connection or try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, page, limit]);

  useEffect(() => {
    if (activeView !== "deliveries") return;
    const timer = setTimeout(() => {
      fetchDeliveries();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDeliveries, activeView]);

  // Date Shift Helpers
  const shiftDate = (days: number) => {
    const parts = selectedDate.split("-");
    const current = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    current.setDate(current.getDate() + days);
    setSelectedDate(formatYMD(current));
    setPage(1);
  };

  const setPresetDate = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setSelectedDate(formatYMD(d));
    setPage(1);
  };

  const todayYMD = useMemo(() => formatYMD(new Date()), []);
  const isToday = selectedDate === todayYMD;
  const isFuture = selectedDate > todayYMD;

  // Mark a Single Delivery
  const handleMarkSingle = async (item: DeliveryListItem) => {
    setProcessingSubId(item.subscription_id);
    try {
      const res = await deliveryService.markDelivered({
        delivery_date: selectedDate,
        subscription_ids: [item.subscription_id],
      });

      if (res.marked && res.marked.includes(item.subscription_id)) {
        showToast(`Delivery for ${item.customer_email} marked as Delivered!`, "success");
      } else if (res.already_marked && res.already_marked.includes(item.subscription_id)) {
        showToast(`Delivery for ${item.customer_email} was already marked as delivered.`, "success");
      } else {
        showToast(`Delivery marked as completed.`, "success");
      }
      fetchDeliveries();
    } catch (err: unknown) {
      console.warn("[AdminDeliveriesPage] Error marking delivery:", err);
      showToast(
        formatUserFriendlyError(err, { fallback: "Failed to mark delivery. Please try again." }),
        "error"
      );
    } finally {
      setProcessingSubId(null);
    }
  };

  // Mark Batch Deliveries
  const handleMarkBatch = async () => {
    if (selectedSubscriptionIds.length === 0) return;
    setIsBatchMarking(true);
    try {
      const res = await deliveryService.markDelivered({
        delivery_date: selectedDate,
        subscription_ids: selectedSubscriptionIds,
      });

      const count = res.marked?.length || selectedSubscriptionIds.length;
      showToast(`Successfully marked ${count} deliveries as delivered!`, "success");
      setSelectedSubscriptionIds([]);
      fetchDeliveries();
    } catch (err: unknown) {
      console.warn("[AdminDeliveriesPage] Error marking batch deliveries:", err);
      showToast(
        formatUserFriendlyError(err, { fallback: "Failed to mark selected deliveries. Please try again." }),
        "error"
      );
    } finally {
      setIsBatchMarking(false);
    }
  };

  // Confirm and Execute Undo Delivery
  const handleConfirmUndo = async () => {
    if (!undoModalItem || !undoModalItem.delivery_id) return;
    setIsUndoing(true);
    try {
      await deliveryService.undoDelivery(undoModalItem.delivery_id);
      showToast(
        `Delivery status undone for ${undoModalItem.customer_email}. Returned to Pending.`,
        "success"
      );
      setUndoModalItem(null);
      fetchDeliveries();
    } catch (err: unknown) {
      console.warn("[AdminDeliveriesPage] Error undoing delivery:", err);
      showToast(
        formatUserFriendlyError(err, { fallback: "Failed to undo delivery status. Please try again." }),
        "error"
      );
    } finally {
      setIsUndoing(false);
    }
  };

  // Client-Side Search & Filter
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      // Status filter
      if (statusFilter === "DELIVERED" && !item.delivered) return false;
      if (statusFilter === "PENDING" && item.delivered) return false;

      // Plan filter
      if (planFilter !== "ALL" && item.plan_type?.toUpperCase() !== planFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const emailMatch = item.customer_email?.toLowerCase().includes(q);
        const nameMatch = (item.customer_name || item.name || `${item.first_name || ""} ${item.last_name || ""}`)?.toLowerCase().includes(q);
        const phoneMatch = (item.customer_phone || item.mobile || item.phone || item.mobile_number)?.toLowerCase().includes(q);
        const addrMatch = item.location_address?.toLowerCase().includes(q);
        const subIdMatch = item.subscription_id?.toLowerCase().includes(q);
        const locIdMatch = item.location_id?.toLowerCase().includes(q);
        if (!emailMatch && !nameMatch && !phoneMatch && !addrMatch && !subIdMatch && !locIdMatch) {
          return false;
        }
      }

      return true;
    });
  }, [deliveries, statusFilter, planFilter, searchQuery]);

  // Quick Stats
  const stats = useMemo(() => {
    const total = deliveries.length;
    const deliveredCount = deliveries.filter((d) => d.delivered).length;
    const pendingCount = total - deliveredCount;
    const completionPct = total > 0 ? Math.round((deliveredCount / total) * 100) : 0;
    return { total, deliveredCount, pendingCount, completionPct };
  }, [deliveries]);

  // Select All Pending toggle
  const pendingFilteredItems = useMemo(() => {
    return filteredDeliveries.filter((d) => !d.delivered);
  }, [filteredDeliveries]);

  const allPendingSelected =
    pendingFilteredItems.length > 0 &&
    pendingFilteredItems.every((d) => selectedSubscriptionIds.includes(d.subscription_id));

  const toggleSelectAllPending = () => {
    if (allPendingSelected) {
      setSelectedSubscriptionIds([]);
    } else {
      setSelectedSubscriptionIds(pendingFilteredItems.map((d) => d.subscription_id));
    }
  };

  const toggleSelectItem = (subscriptionId: string) => {
    setSelectedSubscriptionIds((prev) =>
      prev.includes(subscriptionId)
        ? prev.filter((id) => id !== subscriptionId)
        : [...prev, subscriptionId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white font-medium text-sm transition-all animate-in slide-in-from-bottom-2 duration-200 ${
            toastMessage.type === "success" ? "bg-[#36D068]" : "bg-rose-600"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-white" />
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 hover:bg-white/20 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Header Banner ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-slate-500 text-xs font-medium">
              {activeView === "overview"
                ? "Delivery Analytics Summary"
                : activeView === "forecast"
                ? "Kitchen & Demand Forecasting"
                : activeView === "trend"
                ? "Delivery Fulfillment Trends"
                : activeView === "breakdown"
                ? "Delivery Volume Breakdown"
                : activeView === "optional-meals"
                ? "Optional Meal Popularity"
                : "Daily Operations"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            {activeView === "overview" ? (
              <>
                <PieChart className="w-7 h-7 text-[#36D068]" />
                <span>Delivery Analytics Overview</span>
              </>
            ) : activeView === "forecast" ? (
              <>
                <CalendarClock className="w-7 h-7 text-[#36D068]" />
                <span>Delivery Demand Forecast</span>
              </>
            ) : activeView === "trend" ? (
              <>
                <TrendingUp className="w-7 h-7 text-[#36D068]" />
                <span>Delivery Fulfillment Trend</span>
              </>
            ) : activeView === "breakdown" ? (
              <>
                <Layers className="w-7 h-7 text-[#36D068]" />
                <span>Delivery Breakdown Analytics</span>
              </>
            ) : activeView === "optional-meals" ? (
              <>
                <UtensilsCrossed className="w-7 h-7 text-[#36D068]" />
                <span>Optional Meal Popularity</span>
              </>
            ) : (
              <>
                <Truck className="w-7 h-7 text-[#36D068]" />
                <span>Deliveries Management</span>
              </>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeView === "overview"
              ? "Key performance indicators, completion rates, missed meal analytics, and period-over-period comparisons."
              : activeView === "forecast"
              ? "Upcoming meal preparation and delivery projections for the next 7 to 30 days, categorized by fixed and custom plans."
              : activeView === "trend"
              ? "Historical delivery fulfillment volumes, scheduled vs delivered ratios, and completion trends over time."
              : activeView === "breakdown"
              ? "Delivery volume, completion rates, missed meals, and cancellations split by plan type, package, or weekday."
              : activeView === "optional-meals"
              ? "Most requested optional meals for delivery dates, customer recipe swap preferences, and popularity ranking."
              : "Live schedule of expected meal deliveries per date. Mark completed deliveries, batch-mark multiple orders, or undo delivery status."}
          </p>
        </div>

        {activeView === "deliveries" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 border border-slate-200/90 shadow-xs cursor-pointer hover:border-slate-300"
              title="Export Deliveries Manifest to PDF"
            >
              <Printer className="w-4 h-4 text-[#36D068]" />
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              onClick={fetchDeliveries}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 border border-slate-200 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Deliveries Sub-Navigation Tabs ─── */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: PieChart },
          { id: "forecast", label: "Forecast", icon: CalendarClock },
          { id: "trend", label: "Trend", icon: TrendingUp },
          { id: "breakdown", label: "Breakdown", icon: Layers },
          { id: "optional-meals", label: "Optional Meals", icon: UtensilsCrossed },
          { id: "deliveries", label: "Deliveries", icon: Truck },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isCurrent = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => router.push(`/admin/deliveries?view=${tab.id}`)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isCurrent
                  ? "bg-[#36D068] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isCurrent ? "text-white" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ─── */}
      {activeView === "deliveries" ? (
        <div className="space-y-6">
          {/* ─── Date Navigator & Date Presets ─── */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Date Switcher Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-2xl shadow-xs">
              <Calendar className="w-5 h-5 text-[#36D068]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setPage(1);
                  }
                }}
                className="bg-transparent border-none text-sm font-bold text-slate-900 focus:outline-hidden cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => shiftDate(1)}
              className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="ml-2 hidden sm:block">
              <span className="text-base font-extrabold text-slate-800">
                {formatDateHeader(selectedDate)}
              </span>
              {isToday && (
                <span className="ml-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Date Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setPresetDate(-1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => setPresetDate(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isToday
                  ? "bg-[#36D068] text-white shadow-xs"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPresetDate(1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Future Date Informational Notice */}
        {isFuture && (
          <div className="flex items-center gap-2.5 p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-xs text-amber-900 shadow-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Future Date Notice:</strong> Deliveries scheduled for future dates cannot be marked as delivered until their scheduled delivery date.
            </span>
          </div>
        )}

        {/* ─── Metric Stat Cards for the Date ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50/70 border border-slate-200/60 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Scheduled
            </span>
            <p className="text-xl font-black text-slate-900 mt-1">
              {pagination.total_rows || stats.total}
            </p>
            <span className="text-[10px] text-slate-400">Active subscriptions</span>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              Delivered
            </span>
            <p className="text-xl font-black text-emerald-600 mt-1">{stats.deliveredCount}</p>
            <span className="text-[10px] text-emerald-600/80">
              {stats.completionPct}% completed
            </span>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              Pending Delivery
            </span>
            <p className="text-xl font-black text-amber-600 mt-1">{stats.pendingCount}</p>
            <span className="text-[10px] text-amber-600/80">Awaiting fulfillment</span>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xl font-black text-blue-700">{stats.completionPct}%</p>
              <div className="flex-1 bg-blue-200/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#36D068] h-full rounded-full transition-all duration-300"
                  style={{ width: `${stats.completionPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Batch Actions Toolbar (Shown when pending items are selected) ─── */}
      {selectedSubscriptionIds.length > 0 && (
        <div className="bg-emerald-50 border-2 border-[#36D068] p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#36D068] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {selectedSubscriptionIds.length}
            </div>
            <div>
              <p className="font-bold text-emerald-950 text-sm">
                {selectedSubscriptionIds.length}{" "}
                {selectedSubscriptionIds.length === 1 ? "delivery" : "deliveries"} selected
              </p>
              <p className="text-xs text-emerald-800">
                Ready to mark as delivered for {formatDateHeader(selectedDate)}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubscriptionIds([])}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={handleMarkBatch}
              disabled={isBatchMarking}
              className="px-5 py-2 text-xs font-bold text-white bg-[#36D068] hover:bg-[#2fb85b] rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isBatchMarking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              <span>Mark {selectedSubscriptionIds.length} Delivered</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Filter & Search Bar ─── */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search email, address, subscription ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 pl-9 pr-3.5 py-2 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#36D068] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs border border-slate-200/60">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === "PENDING"
                  ? "bg-amber-500 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending ({stats.pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("DELIVERED")}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === "DELIVERED"
                  ? "bg-[#36D068] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Delivered ({stats.deliveredCount})
            </button>
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
          >
            <option value="ALL">All Plans</option>
            <option value="FIXED">Fixed Plans</option>
            <option value="CUSTOM">Custom Plans</option>
          </select>

          {/* Limit selector */}
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* ─── Deliveries Table Card ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        {/* Loading */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#36D068] animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Fetching delivery orders for {formatDateHeader(selectedDate)}...
            </p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <button
              type="button"
              onClick={fetchDeliveries}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-[#36D068]">
              <Truck className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              No Deliveries Scheduled for this Date
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are no active subscription meal deliveries expected on{" "}
              <strong>{formatDateHeader(selectedDate)}</strong> matching your filters.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPresetDate(0)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Go to Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setPlanFilter("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAllPending}
                      className="cursor-pointer text-slate-500 hover:text-slate-800"
                      title={allPendingSelected ? "Deselect All" : "Select All Pending"}
                    >
                      {allPendingSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#36D068]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4 text-center">Plan Type</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDeliveries.map((item, idx) => {
                  const isSelected = selectedSubscriptionIds.includes(item.subscription_id);
                  const isProcessing = processingSubId === item.subscription_id;

                  return (
                    <tr
                      key={item.subscription_id || idx}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        item.delivered ? "bg-emerald-50/20" : ""
                      }`}
                    >
                      {/* Checkbox (only for pending deliveries) */}
                      <td className="py-3.5 px-4 text-center">
                        {!item.delivered ? (
                          <button
                            type="button"
                            onClick={() => toggleSelectItem(item.subscription_id)}
                            className="cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#36D068]" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                            )}
                          </button>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#36D068] mx-auto opacity-70" />
                        )}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#36D068]/15 text-[#36D068] font-bold flex items-center justify-center text-xs shrink-0">
                            {item.customer_email?.[0]?.toUpperCase() || "C"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate" title={item.customer_email}>
                              {item.customer_email}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              Sub ID: {item.subscription_id?.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Delivery Address */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-start gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="truncate" title={item.location_address || "No address provided"}>
                            {item.location_address || "No delivery address specified"}
                          </span>
                        </div>
                      </td>

                      {/* Plan Type */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.plan_type?.toUpperCase() === "CUSTOM"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.plan_type || "FIXED"}
                        </span>
                      </td>

                      {/* Delivery Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {item.delivered ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-[#36D068]" />
                              <span>Delivered</span>
                            </span>
                            {item.delivered_at && (
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                at {formatTime(item.delivered_at)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Actions: Mark or Un-mark */}
                      <td className="py-3.5 px-4 text-right">
                        {!item.delivered ? (
                          <button
                            type="button"
                            onClick={() => handleMarkSingle(item)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 rounded-xl bg-[#36D068] hover:bg-[#2fb85b] text-white font-bold text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs disabled:opacity-50"
                            title="Mark as Delivered"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Mark Delivered</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setUndoModalItem(item)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-semibold text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                            title="Undo delivery status"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Undo Delivery</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Pagination Footer ─── */}
        {!isLoading && filteredDeliveries.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total_rows)} of{" "}
              {pagination.total_rows} total scheduled deliveries
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
      ) : activeView === "forecast" ? (
        <DeliveryForecastView
          onSwitchToDeliveriesTab={() => {
            router.push("/admin/deliveries?view=deliveries");
          }}
        />
      ) : activeView === "trend" ? (
        <DeliveryTrendView
          onSwitchToDeliveriesTab={() => {
            router.push("/admin/deliveries?view=deliveries");
          }}
        />
      ) : activeView === "breakdown" ? (
        <DeliveryBreakdownView
          onSwitchToDeliveriesTab={() => {
            router.push("/admin/deliveries?view=deliveries");
          }}
        />
      ) : activeView === "optional-meals" ? (
        <DeliveryOptionalMealsView
          onSwitchToDeliveriesTab={() => {
            router.push("/admin/deliveries?view=deliveries");
          }}
        />
      ) : (
        <DeliveryOverviewSummary
          onSwitchToDeliveriesTab={() => {
            router.push("/admin/deliveries?view=deliveries");
          }}
        />
      )}

      {/* ─── Undo Delivery Confirmation Modal ─── */}
      {undoModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Undo Delivery Status?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to un-mark this delivery? The status will be reset back to{" "}
                <strong>Pending</strong>.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-xs space-y-1">
              <p className="text-slate-500">
                Customer: <strong className="text-slate-800">{undoModalItem.customer_email}</strong>
              </p>
              <p className="text-slate-500">
                Delivery Date:{" "}
                <strong className="text-slate-800">{formatDateHeader(selectedDate)}</strong>
              </p>
              {undoModalItem.delivery_id && (
                <p className="text-slate-400 font-mono text-[10px]">
                  Marker ID: {undoModalItem.delivery_id}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUndoModalItem(null)}
                disabled={isUndoing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUndo}
                disabled={isUndoing}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUndoing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Undo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PDF Export & Print Modal ─── */}
      <DeliveryPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        deliveryDate={selectedDate}
        deliveries={filteredDeliveries}
        statusFilter={statusFilter}
        planFilter={planFilter}
        searchQuery={searchQuery}
        stats={stats}
      />
    </div>
  );
}

export default function AdminDeliveriesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white border border-slate-200/80 rounded-3xl p-16 shadow-sm text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#36D068] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Loading Deliveries Management...</p>
        </div>
      }
    >
      <AdminDeliveriesContent />
    </Suspense>
  );
}

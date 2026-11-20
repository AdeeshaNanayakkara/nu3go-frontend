"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarX,
  MapPin,
  Check,
  X,
  Lock,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
  Utensils,
  Sparkles,
  Loader2,
  Ban,
  ArrowLeft,
  ArrowRight,
  Package,
  Clock,
} from "lucide-react";
import {
  subscriptionService,
  type SubscriptionResItem,
  type SubscriptionScheduledDate,
} from "@/services/api/subscription.service";
import { type LocationItem } from "@/services/api/location.service";
import {
  optionalMealRequestService,
  type OptionalMealRequestRes,
} from "@/services/api/optional-meal-request.service";
import { packageService, type PublicPackage } from "@/services/api/package.service";
import { cn } from "@/lib/utils";

interface SubscriptionCalendarProps {
  subscription: SubscriptionResItem;
  locations: LocationItem[];
  onUpdated: (updated: SubscriptionResItem) => void;
}

function formatYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toYMD(dateLike?: string): string {
  if (!dateLike) return "";
  return dateLike.slice(0, 10);
}

function parseYMD(ymd: string): Date | null {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatFriendly(ymd: string): string {
  const date = parseYMD(ymd);
  if (!date) return ymd || "—";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatShortDate(ymd: string): string {
  const date = parseYMD(ymd);
  if (!date) return ymd || "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const LABEL = "font-oswald text-[8px] sm:text-[9px] font-bold uppercase px-1 py-0.5 rounded-md leading-none";

export function SubscriptionCalendar({ subscription, locations, onUpdated }: SubscriptionCalendarProps) {
  const startYMD = toYMD(subscription.started_at || subscription.created_at);
  const endYMD = toYMD(subscription.valid_until);

  const todayYMD = useMemo(() => formatYMD(new Date()), []);
  const tomorrowYMD = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return formatYMD(t);
  }, []);

  const [monthDate, setMonthDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Unsaved date selections, keyed by the location they were picked under
  const [pendingByLocation, setPendingByLocation] = useState<Record<string, string[]>>({});
  const [addLocationId, setAddLocationId] = useState<string>(
    () => locations.find((l) => l.is_default)?.id || locations[0]?.id || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Delivery-date action popup (change address / unschedule / optional meal)
  const [actionDate, setActionDate] = useState<string | null>(null);
  const [actionView, setActionView] = useState<"choose" | "address" | "unschedule" | "optional">("choose");
  const [actionLocationId, setActionLocationId] = useState<string>("");
  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [optionalRequests, setOptionalRequests] = useState<OptionalMealRequestRes[]>([]);
  const [packageDetail, setPackageDetail] = useState<PublicPackage | null>(null);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);

  useEffect(() => {
    let alive = true;
    optionalMealRequestService
      .getSubscriptionRequests(subscription.id)
      .then((items) => {
        if (alive) setOptionalRequests(items || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [subscription.id]);

  const resolvedPackageId = subscription.package_id || subscription.package?.id;
  useEffect(() => {
    if (!resolvedPackageId) return;
    let alive = true;
    setIsLoadingPackage(true);
    packageService
      .getPublicPackageDetail(resolvedPackageId)
      .then((pkg) => {
        if (alive && pkg) setPackageDetail(pkg);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setIsLoadingPackage(false);
      });
    return () => {
      alive = false;
    };
  }, [resolvedPackageId]);

  const optionalRequestsMap = useMemo(() => {
    const map = new Map<string, OptionalMealRequestRes>();
    optionalRequests.forEach((r) => {
      if (r.delivery_date && !r.cancelled_at) map.set(r.delivery_date.split("T")[0], r);
    });
    return map;
  }, [optionalRequests]);

  const scheduledMap = useMemo(() => {
    const map: Record<string, SubscriptionScheduledDate> = {};
    (subscription.locations || []).forEach((entry) => {
      const key = toYMD(entry.date);
      if (key) map[key] = { ...entry, date: key };
    });
    return map;
  }, [subscription.locations]);

  const datesPerLocation = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(scheduledMap).forEach((entry) => {
      counts[entry.location_id] = (counts[entry.location_id] || 0) + 1;
    });
    return counts;
  }, [scheduledMap]);

  const scheduledByLocation = useMemo(() => {
    const groups: Record<string, SubscriptionScheduledDate[]> = {};
    Object.values(scheduledMap).forEach((entry) => {
      if (!groups[entry.location_id]) groups[entry.location_id] = [];
      groups[entry.location_id].push(entry);
    });
    Object.values(groups).forEach((arr) => arr.sort((a, b) => a.date.localeCompare(b.date)));
    return groups;
  }, [scheduledMap]);

  const scheduledCount = subscription.scheduled_days ?? Object.keys(scheduledMap).length;
  const purchasedCount = subscription.purchased_days ?? 0;
  const remainingDays = subscription.remaining_days ?? Math.max(0, purchasedCount - scheduledCount);
  const pendingOwner = useMemo(() => {
    const owner: Record<string, string> = {};
    Object.entries(pendingByLocation).forEach(([locId, dates]) => {
      dates.forEach((d) => {
        owner[d] = locId;
      });
    });
    return owner;
  }, [pendingByLocation]);
  const totalPending = Object.keys(pendingOwner).length;
  const availableSlots = Math.max(0, remainingDays - totalPending);

  const locationNumber = (locId?: string) => {
    const idx = locations.findIndex((l) => l.id === locId);
    return idx >= 0 ? idx + 1 : 0;
  };

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  // Mon–Fri only grid, aligned to the first/last weekday of the month (same as the fixed-plan calendar)
  const calendarCells = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const gridStart = new Date(first);
    const firstDow = first.getDay();
    if (firstDow === 0) gridStart.setDate(gridStart.getDate() + 1);
    else if (firstDow === 6) gridStart.setDate(gridStart.getDate() + 2);
    else if (firstDow > 1) gridStart.setDate(gridStart.getDate() - (firstDow - 1));

    const gridEnd = new Date(last);
    const lastDow = last.getDay();
    if (lastDow === 0) gridEnd.setDate(gridEnd.getDate() - 2);
    else if (lastDow === 6) gridEnd.setDate(gridEnd.getDate() - 1);
    else if (lastDow < 5) gridEnd.setDate(gridEnd.getDate() + (5 - lastDow));

    const cells: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean; dow: number }> = [];
    const cursor = new Date(gridStart);
    while (cursor <= gridEnd) {
      const dow = cursor.getDay();
      if (dow === 6) {
        cursor.setDate(cursor.getDate() + 2);
        continue;
      }
      if (dow === 0) {
        cursor.setDate(cursor.getDate() + 1);
        continue;
      }
      cells.push({
        dateStr: formatYMD(cursor),
        dayNum: cursor.getDate(),
        isCurrentMonth: cursor.getMonth() === month,
        dow,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  }, [year, month]);

  const handlePrevMonth = () => setMonthDate((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const handleNextMonth = () => setMonthDate((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));

  const jumpTo = (ymd: string) => {
    const d = parseYMD(ymd);
    if (d) setMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const getLocationLabel = (locId?: string) => {
    if (!locId) return "Unknown location";
    const loc = locations.find((l) => l.id === locId);
    return loc?.address || "Saved location";
  };

  const togglePendingDate = (dateStr: string) => {
    setError(null);
    setSuccess(null);
    const owner = pendingOwner[dateStr];
    if (owner && owner !== addLocationId) {
      setError(`That date is already selected for ${getLocationLabel(owner)}.`);
      return;
    }
    if (owner === addLocationId) {
      setPendingByLocation((prev) => ({
        ...prev,
        [addLocationId]: (prev[addLocationId] || []).filter((d) => d !== dateStr),
      }));
      return;
    }
    if (remainingDays - totalPending <= 0) {
      setError(`You only have ${remainingDays} day${remainingDays === 1 ? "" : "s"} remaining to schedule.`);
      return;
    }
    setPendingByLocation((prev) => ({
      ...prev,
      [addLocationId]: [...(prev[addLocationId] || []), dateStr],
    }));
  };

  const handleCellClick = (dateStr: string) => {
    const outOfRange = (startYMD && dateStr < startYMD) || (endYMD && dateStr > endYMD);
    const isPast = dateStr < tomorrowYMD;
    const scheduled = scheduledMap[dateStr];

    if (scheduled) {
      if (dateStr < todayYMD) return;
      setError(null);
      setSuccess(null);
      setActionDate(dateStr);
      setActionView("choose");
      setActionLocationId(scheduled.location_id);
      setActionError(null);
      return;
    }

    if (isPast || outOfRange) return;

    if (!addLocationId) {
      setError("Please select a delivery location first.");
      return;
    }

    togglePendingDate(dateStr);
  };

  const handleSavePending = async () => {
    const groups = Object.entries(pendingByLocation).filter(([, dates]) => dates.length > 0);
    if (groups.length === 0) return;
    setIsSaving(true);
    setError(null);
    let savedCount = 0;
    const failures: string[] = [];
    // One POST per location; each location's dates are saved against that location only
    for (const [locId, dates] of groups) {
      try {
        const updated = await subscriptionService.addSubscriptionDates(subscription.id, [...dates].sort(), locId);
        if (updated) onUpdated(updated);
        savedCount += dates.length;
        setPendingByLocation((prev) => {
          const next = { ...prev };
          delete next[locId];
          return next;
        });
      } catch (err: unknown) {
        failures.push(`${getLocationLabel(locId)}: ${err instanceof Error ? err.message : "Failed to schedule dates."}`);
      }
    }
    if (savedCount > 0) {
      setSuccess(`${savedCount} meal${savedCount === 1 ? "" : "s"} requested successfully!`);
      setTimeout(() => setSuccess(null), 3500);
    }
    if (failures.length > 0) setError(failures.join(" • "));
    setIsSaving(false);
  };

  const handleClearPending = () => {
    setPendingByLocation({});
    setError(null);
  };

  const closeActionModal = () => {
    if (isActing) return;
    setActionDate(null);
    setActionError(null);
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  };

  // PATCH /api/v1/subscriptions/{id}/dates/{date}
  const handleChangeAddress = async () => {
    if (!actionDate) return;
    setIsActing(true);
    setActionError(null);
    try {
      const updated = await subscriptionService.updateSubscriptionDate(subscription.id, actionDate, {
        location_id: actionLocationId,
      });
      if (updated) onUpdated(updated);
      showSuccess(`Delivery address for ${formatFriendly(actionDate)} updated.`);
      setActionDate(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to update delivery address.");
    } finally {
      setIsActing(false);
    }
  };

  // DELETE /api/v1/subscriptions/{id}/dates/{date}
  const handleUnschedule = async () => {
    if (!actionDate) return;
    setIsActing(true);
    setActionError(null);
    try {
      const updated = await subscriptionService.removeSubscriptionDate(subscription.id, actionDate);
      if (updated) onUpdated(updated);
      showSuccess(`${formatFriendly(actionDate)} unscheduled — the day returned to your remaining balance.`);
      setActionDate(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to unschedule this meal.");
    } finally {
      setIsActing(false);
    }
  };

  // Chef's alternative dish configured for the weekday of a scheduled date
  const getOptionalMealForDate = (dateStr: string) => {
    const menus = packageDetail?.menus;
    if (!menus || !Array.isArray(menus) || menus.length === 0) return null;
    const parsed = parseYMD(dateStr);
    if (!parsed) return null;
    const dow = parsed.getDay();
    if (dow < 1 || dow > 5) return null;
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    const sortedDates = Object.keys(scheduledMap).sort();
    const idx = sortedDates.indexOf(dateStr);
    const weekIndex = idx >= 0 ? Math.floor(idx / 5) : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ordered = [...menus].sort((a: any, b: any) => (a.sequence ?? 0) - (b.sequence ?? 0));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeMenu: any = ordered[weekIndex % ordered.length] || ordered[0];
    if (!activeMenu?.meals || !Array.isArray(activeMenu.meals)) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slot = activeMenu.meals.find((m: any) => m.day && String(m.day).toUpperCase() === dayNames[dow]);
    if (!slot) return null;
    const opt = slot.optional_meal;
    const optId = opt?.id || slot.optional_meal_id;
    if (!optId) return null;
    return {
      id: String(optId),
      name: (opt?.name as string) || "Chef's Daily Alternative",
      description: opt?.description as string | undefined,
      image_url: opt?.image_url as string | undefined,
    };
  };

  // POST /api/v1/optional-meal-requests
  const handleRequestOptionalMeal = async (mealId: string) => {
    if (!actionDate) return;
    setIsActing(true);
    setActionError(null);
    try {
      const result = await optionalMealRequestService.createRequest({
        subscription_id: subscription.id,
        delivery_date: actionDate,
        meal_id: mealId,
      });
      setOptionalRequests((prev) => [
        ...prev.filter((r) => r.delivery_date.split("T")[0] !== actionDate),
        {
          id: result?.id || `opt-${Date.now()}`,
          subscription_id: subscription.id,
          delivery_date: actionDate,
          meal_id: mealId,
          created_at: result?.created_at || new Date().toISOString(),
        } as OptionalMealRequestRes,
      ]);
      showSuccess(`Optional meal requested for ${formatFriendly(actionDate)}.`);
      setActionDate(null);
      optionalMealRequestService
        .getSubscriptionRequests(subscription.id)
        .then((items) => {
          if (items && items.length > 0) setOptionalRequests(items);
        })
        .catch(() => {});
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Could not submit optional meal request.");
    } finally {
      setIsActing(false);
    }
  };

  // POST /api/v1/optional-meal-requests/{id}/cancel
  const handleCancelOptionalMeal = async (requestId: string) => {
    if (!actionDate) return;
    setIsActing(true);
    setActionError(null);
    try {
      await optionalMealRequestService.cancelRequest(requestId);
      setOptionalRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, cancelled_at: new Date().toISOString() } : r))
      );
      showSuccess(`Optional meal for ${formatFriendly(actionDate)} cancelled. Regular meal restored.`);
      setActionDate(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Could not cancel optional meal request.");
    } finally {
      setIsActing(false);
    }
  };

  const actionScheduled = actionDate ? scheduledMap[actionDate] : undefined;
  const actionOptionalReq = actionDate ? optionalRequestsMap.get(actionDate) : undefined;
  const actionOptionalMeal = actionDate && actionView === "optional" ? getOptionalMealForDate(actionDate) : null;

  const monthLabel = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const hasScheduledDates = Object.keys(scheduledByLocation).length > 0;
  const deliveredCount = Object.keys(scheduledMap).filter((d) => d < todayYMD).length;

  return (
    <div className="relative w-full bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden font-poppins">
      {/* ─── Header ─── */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-emerald-950 text-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#36D068]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-[#36D068] bg-[#36D068]/20 border border-[#36D068]/40 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#36D068] animate-ping" />
              Custom Plan Schedule
            </span>
            <span className="text-xs text-white/60 font-mono">
              Active: {formatShortDate(startYMD)} – {formatShortDate(endYMD)}
            </span>
          </div>
          <h2 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#36D068]" />
            <span>Delivery Calendar</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/80 font-normal">
            Pick a location, choose your delivery dates within the active period, then request your meals.
          </p>
        </div>

        {/* Metric pills */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-5 mt-4 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">Start Date</span>
            <span className="font-oswald text-sm sm:text-base font-bold text-white uppercase tracking-wide block truncate">
              {formatShortDate(startYMD)}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Activated
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">End Date</span>
            <span className="font-oswald text-sm sm:text-base font-bold text-white uppercase tracking-wide block truncate">
              {formatShortDate(endYMD)}
            </span>
            <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> Plan Ends
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">Purchased</span>
            <span className="font-oswald text-sm sm:text-base font-bold text-[#36D068] uppercase tracking-wide block truncate">
              {purchasedCount} Day{purchasedCount === 1 ? "" : "s"}
            </span>
            <span className="text-[10px] text-white/60 font-medium block mt-0.5">Total balance</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">Scheduled</span>
            <span className="font-oswald text-sm sm:text-base font-bold text-white uppercase tracking-wide block truncate">
              {scheduledCount} Day{scheduledCount === 1 ? "" : "s"}
            </span>
            <span className="text-[10px] text-white/60 font-medium block mt-0.5">{deliveredCount} delivered</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">Remaining</span>
            <span className="font-oswald text-sm sm:text-base font-bold text-cyan-300 uppercase tracking-wide block truncate">
              {remainingDays} Day{remainingDays === 1 ? "" : "s"}
            </span>
            <span className="text-[10px] text-white/60 font-medium block mt-0.5">To schedule</span>
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="p-5 sm:p-6 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Location cards */}
        {remainingDays > 0 && locations.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold font-oswald uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#28B454]" />
              <span>1. Select Delivery Location</span>
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {locations.map((loc) => {
                const isSelected = addLocationId === loc.id;
                const count = (datesPerLocation[loc.id] || 0) + (pendingByLocation[loc.id]?.length || 0);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    title={loc.address}
                    onClick={() => {
                      setAddLocationId(loc.id);
                      setError(null);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full border text-[11px] font-semibold shrink-0 max-w-[220px] transition-all cursor-pointer",
                      isSelected
                        ? "border-[#28B454] bg-emerald-50 text-[#15803D]"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0",
                        isSelected ? "bg-[#28B454] text-white" : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {locationNumber(loc.id)}
                    </span>
                    <span className="truncate">{loc.address}</span>
                    {loc.is_default && (
                      <span className="text-[8px] font-bold uppercase text-[#15803D] bg-emerald-100 px-1 py-0.5 rounded-full shrink-0">
                        Default
                      </span>
                    )}
                    {count > 0 && (
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {remainingDays > 0 && locations.length === 0 && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Add a delivery location in your profile before scheduling new dates.</span>
          </div>
        )}

        {/* Jump buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => jumpTo(startYMD)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-[11px] font-oswald font-bold uppercase tracking-wide text-slate-700 transition-all cursor-pointer"
          >
            Start: {formatShortDate(startYMD)}
          </button>
          <button
            type="button"
            onClick={() => jumpTo(todayYMD)}
            className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[11px] font-oswald font-bold uppercase tracking-wide text-[#15803D] border border-emerald-200 transition-all cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => jumpTo(endYMD)}
            className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-[11px] font-oswald font-bold uppercase tracking-wide text-amber-800 border border-amber-200 transition-all cursor-pointer"
          >
            End: {formatShortDate(endYMD)}
          </button>
        </div>

        {/* Calendar container */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50/70 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-oswald text-lg sm:text-xl font-black uppercase text-neutral-900 tracking-wide">
                {monthLabel}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {remainingDays > 0
                  ? "2. Tap dates to deliver, then press Request Meal."
                  : "All purchased days are scheduled. Tap a date to edit it."}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center font-oswald text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200/70">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {calendarCells.map((cell, idx) => {
              const { dateStr, dayNum, isCurrentMonth } = cell;
              const scheduled = scheduledMap[dateStr];
              const pendingOwnerId = pendingOwner[dateStr];
              const isPending = pendingOwnerId === addLocationId;
              const isPendingOther = Boolean(pendingOwnerId) && !isPending;
              const isStart = Boolean(startYMD) && dateStr === startYMD;
              const isEnd = Boolean(endYMD) && dateStr === endYMD;
              const isToday = dateStr === todayYMD;
              const isPast = dateStr < todayYMD;
              const insideCycle =
                (!startYMD || dateStr >= startYMD) && (!endYMD || dateStr <= endYMD);
              const isOpen =
                !scheduled && !isPendingOther && !isPast && insideCycle && (isPending || availableSlots > 0);
              const isInteractive = scheduled ? !isPast : isOpen;
              const hasOptionalReq = Boolean(scheduled) && optionalRequestsMap.has(dateStr);

              let cellBg = "bg-white/40 text-slate-400 border border-transparent";
              if (!isCurrentMonth) {
                cellBg = "opacity-30 bg-slate-100/50 text-slate-400 border border-transparent";
              } else if (isPending) {
                cellBg = "bg-amber-50/90 hover:bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs font-semibold";
              } else if (isPendingOther) {
                cellBg = "bg-amber-50/50 text-amber-800/70 border border-dashed border-amber-300";
              } else if (scheduled) {
                if (hasOptionalReq) {
                  cellBg = "bg-purple-50/90 hover:bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs font-semibold";
                } else if (scheduled.locked) {
                  cellBg = "bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs";
                } else if (isPast) {
                  cellBg = "bg-emerald-100/60 hover:bg-emerald-100 text-[#15803D] border border-emerald-300/80";
                } else if (isToday) {
                  cellBg = "bg-emerald-50 text-neutral-900 border-2 border-[#36D068] shadow-md shadow-[#36D068]/20 ring-2 ring-[#36D068]/20 font-black";
                } else {
                  cellBg = "bg-white hover:bg-emerald-50/60 text-neutral-900 border border-emerald-200/90 shadow-2xs";
                }
              } else if (insideCycle) {
                cellBg = "bg-white text-neutral-900 border border-slate-200/70 hover:bg-slate-50";
              } else {
                cellBg = "bg-white text-slate-400 border border-slate-200/50";
              }

              return (
                <button
                  key={`${dateStr}-${idx}`}
                  type="button"
                  disabled={!isInteractive}
                  onClick={() => handleCellClick(dateStr)}
                  title={
                    scheduled
                      ? `${getLocationLabel(scheduled.location_id)}${scheduled.locked ? " — locked" : ""}`
                      : pendingOwnerId
                      ? getLocationLabel(pendingOwnerId)
                      : undefined
                  }
                  className={cn(
                    "h-14 sm:h-16 rounded-2xl p-1 sm:p-1.5 transition-all flex flex-col justify-between items-center relative",
                    isInteractive ? "cursor-pointer" : "cursor-default",
                    cellBg
                  )}
                >
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-oswald leading-none",
                        scheduled || isPending ? "font-bold" : "font-medium"
                      )}
                    >
                      {dayNum}
                    </span>
                    {isPending ? (
                      <Check className="w-3 h-3 text-amber-600" />
                    ) : hasOptionalReq ? (
                      <Sparkles className="w-3 h-3 text-purple-600" />
                    ) : scheduled?.locked ? (
                      <Lock className="w-3 h-3 text-slate-500" />
                    ) : scheduled ? (
                      isPast ? (
                        <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                      ) : isToday ? (
                        <span className="w-2 h-2 rounded-full bg-[#36D068] animate-ping" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#36D068]" />
                      )
                    ) : null}
                  </div>

                  <div className="w-full flex justify-center">
                    {isPending ? (
                      <span className={cn(LABEL, "bg-amber-500 text-black")}>
                        Selected · L{locationNumber(pendingOwnerId)}
                      </span>
                    ) : isPendingOther ? (
                      <span className={cn(LABEL, "bg-amber-200 text-amber-900")}>
                        L{locationNumber(pendingOwnerId)}
                      </span>
                    ) : isStart ? (
                      <span className={cn(LABEL, "bg-[#15803D] text-white")}>Start</span>
                    ) : isEnd ? (
                      <span className={cn(LABEL, "bg-amber-500 text-black")}>End</span>
                    ) : hasOptionalReq ? (
                      <span className={cn(LABEL, "bg-purple-600 text-white")}>Optional</span>
                    ) : scheduled?.locked ? (
                      <span className={cn(LABEL, "bg-slate-600 text-white")}>Locked</span>
                    ) : scheduled ? (
                      <span className="text-[8px] sm:text-[9px] text-[#15803D] font-medium">
                        {isPast ? "Delivered" : "Delivery"} · L{locationNumber(scheduled.location_id)}
                      </span>
                    ) : isToday ? (
                      <span className={cn(LABEL, "bg-[#36D068] text-black")}>Today</span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 px-2">
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 inline-block" />
              <span>Delivered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-white border border-emerald-200 inline-block" />
              <span>Scheduled ({scheduledCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-300 inline-block" />
              <span className="text-amber-700 font-medium">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300 inline-block" />
              <span>Locked</span>
            </div>
          </div>
          <span className="font-oswald font-bold text-slate-500 uppercase tracking-wide">Mon – Fri 7:00 – 8:30 AM</span>
        </div>

        {/* Pending dates — Request Meal */}
        {totalPending > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                {totalPending} date{totalPending === 1 ? "" : "s"} selected
              </span>
              <span className="text-[11px] text-amber-700">
                Will use {totalPending} of your {remainingDays} remaining day{remainingDays === 1 ? "" : "s"}
              </span>
            </div>
            <div className="space-y-2">
              {Object.entries(pendingByLocation)
                .filter(([, dates]) => dates.length > 0)
                .map(([locId, dates]) => (
                  <div key={locId} className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 max-w-[220px]">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        L{locationNumber(locId)} · {getLocationLabel(locId)}
                      </span>
                    </span>
                    {[...dates].sort().map((d) => (
                      <span key={d} className="px-2.5 py-1 bg-amber-200/70 rounded-lg text-[10px] font-bold text-amber-900">
                        {formatShortDate(d)}
                      </span>
                    ))}
                  </div>
                ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearPending}
                disabled={isSaving}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSavePending}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2ca752] text-white text-xs font-bold font-oswald uppercase tracking-wider shadow-md shadow-[#36D068]/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Requesting...</span>
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Request Meal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Delivery date action popup: change address / unschedule / optional meal */}
        {actionDate && actionScheduled && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={closeActionModal}
          >
            <div
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 font-poppins max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0",
                      actionView === "unschedule"
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : actionView === "optional"
                        ? "bg-purple-50 border-purple-200 text-purple-600"
                        : actionView === "address"
                        ? "bg-sky-50 border-sky-200 text-sky-600"
                        : "bg-emerald-50 border-emerald-200 text-[#15803D]"
                    )}
                  >
                    {actionView === "unschedule" ? (
                      <CalendarX className="w-5 h-5" />
                    ) : actionView === "optional" ? (
                      <Sparkles className="w-5 h-5" />
                    ) : actionView === "address" ? (
                      <MapPin className="w-5 h-5" />
                    ) : (
                      <Utensils className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-oswald text-xl font-bold uppercase text-neutral-900 tracking-tight">
                      {actionView === "unschedule"
                        ? "Unschedule Meal"
                        : actionView === "optional"
                        ? "Optional Meal Request"
                        : actionView === "address"
                        ? "Change Delivery Address"
                        : "Meal Delivery Options"}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Delivery Date:{" "}
                      <strong className="text-neutral-900 font-semibold">{formatFriendly(actionDate)}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#28B454] shrink-0" />
                      <span className="truncate max-w-[260px]">{getLocationLabel(actionScheduled.location_id)}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={isActing}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {actionView !== "choose" && (
                <button
                  type="button"
                  onClick={() => {
                    setActionView("choose");
                    setActionError(null);
                  }}
                  disabled={isActing}
                  className="inline-flex items-center gap-1.5 text-xs font-oswald font-bold uppercase tracking-wider text-slate-500 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose Another Option</span>
                </button>
              )}

              {actionError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* ── Choose ── */}
              {actionView === "choose" && (
                <div className="space-y-3.5 py-1">
                  <p className="text-xs text-slate-600 font-medium">Please select an action for this scheduled delivery date:</p>

                  {actionScheduled.locked && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span>
                        This date is locked (past its change cutoff), so the address can no longer be changed and the meal
                        can&apos;t be unscheduled.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    {/* Change Address */}
                    <button
                      type="button"
                      disabled={actionScheduled.locked}
                      onClick={() => {
                        setActionView("address");
                        setActionError(null);
                      }}
                      className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/50 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer shadow-2xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:shadow-2xs"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-oswald text-base font-bold uppercase text-neutral-900 group-hover:text-sky-700 transition-colors">
                            Change Address
                          </h4>
                          <p className="text-xs text-slate-500">Deliver this day&apos;s meal to a different saved location.</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </button>

                    {/* Unschedule Meal */}
                    <button
                      type="button"
                      disabled={actionScheduled.locked}
                      onClick={() => {
                        setActionView("unschedule");
                        setActionError(null);
                      }}
                      className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50/50 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer shadow-2xs hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:shadow-2xs"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                          <CalendarX className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-oswald text-base font-bold uppercase text-neutral-900 group-hover:text-rose-700 transition-colors">
                            Unschedule Meal
                          </h4>
                          <p className="text-xs text-slate-500">
                            Remove this delivery date. The day returns to your remaining balance.
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </button>

                    {/* Optional Meal Request */}
                    <button
                      type="button"
                      onClick={() => {
                        setActionView("optional");
                        setActionError(null);
                      }}
                      className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/50 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer shadow-2xs hover:shadow-md"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-oswald text-base font-bold uppercase text-neutral-900 group-hover:text-purple-700 transition-colors">
                            Optional Meal Request
                          </h4>
                          <p className="text-xs text-slate-500">
                            View and request the chef&apos;s alternative optional dish for this date.
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Change address ── */}
              {actionView === "address" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-oswald font-bold uppercase tracking-wider text-slate-700">
                      Select new delivery location
                    </label>
                    <div className="space-y-2">
                      {locations.map((loc) => {
                        const selected = actionLocationId === loc.id;
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => setActionLocationId(loc.id)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer",
                              selected
                                ? "border-[#28B454] bg-emerald-50/60 ring-2 ring-[#28B454]/20"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            )}
                          >
                            <span
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                                selected ? "bg-[#28B454] text-white" : "bg-slate-200 text-slate-600"
                              )}
                            >
                              {locationNumber(loc.id)}
                            </span>
                            <span className="flex-1 min-w-0 text-xs font-semibold text-slate-900 truncate">{loc.address}</span>
                            {loc.id === actionScheduled.location_id && (
                              <span className="text-[9px] font-bold uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                                Current
                              </span>
                            )}
                            {selected && <Check className="w-4 h-4 text-[#28B454] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActionView("choose")}
                      disabled={isActing}
                      className="px-4 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:text-neutral-900 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Back to Options
                    </button>
                    <button
                      type="button"
                      onClick={handleChangeAddress}
                      disabled={isActing || !actionLocationId || actionLocationId === actionScheduled.location_id}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] disabled:bg-emerald-300 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isActing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" />
                          <span>Confirm New Address</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Unschedule ── */}
              {actionView === "unschedule" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="font-medium">
                      This removes the delivery on {formatFriendly(actionDate)}. The day goes back to your remaining balance so
                      you can schedule it again — there is no wallet refund.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActionView("choose")}
                      disabled={isActing}
                      className="px-4 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:text-neutral-900 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Keep Meal
                    </button>
                    <button
                      type="button"
                      onClick={handleUnschedule}
                      disabled={isActing}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isActing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Unscheduling...</span>
                        </>
                      ) : (
                        <>
                          <CalendarX className="w-4 h-4" />
                          <span>Confirm Unschedule</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Optional meal ── */}
              {actionView === "optional" && (
                <div className="space-y-4">
                  {actionOptionalReq ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                          <h4 className="font-oswald text-sm font-bold uppercase tracking-wide text-purple-900">
                            Optional Meal Request Active
                          </h4>
                        </div>
                        <p className="text-xs text-purple-800 leading-relaxed">
                          You have already requested an optional meal for this date. The kitchen will prepare the chef&apos;s
                          alternative dish instead of your regular meal.
                        </p>
                      </div>
                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setActionView("choose")}
                          className="px-4 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:text-neutral-900 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => actionOptionalReq.id && handleCancelOptionalMeal(actionOptionalReq.id)}
                          disabled={isActing}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isActing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Reverting...</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4" />
                              <span>Cancel Optional Meal (Keep Regular)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : isLoadingPackage ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-3 text-slate-500 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                      <span className="text-xs font-medium">Checking menu alternative dishes...</span>
                    </div>
                  ) : actionOptionalMeal ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            Chef&apos;s Daily Alternative
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Available</span>
                        </div>

                        {actionOptionalMeal.image_url && (
                          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={actionOptionalMeal.image_url}
                              alt={actionOptionalMeal.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div>
                          <h4 className="font-oswald text-lg font-bold uppercase text-neutral-900">{actionOptionalMeal.name}</h4>
                          {actionOptionalMeal.description && (
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{actionOptionalMeal.description}</p>
                          )}
                        </div>

                        <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80 text-purple-950 text-xs space-y-1.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-purple-700/80 font-medium block">Delivery Date:</span>
                              <strong className="text-purple-950">{formatFriendly(actionDate)}</strong>
                            </div>
                            <div>
                              <span className="text-purple-700/80 font-medium block">Selected Dish:</span>
                              <strong className="text-purple-950 truncate block">{actionOptionalMeal.name}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setActionView("choose")}
                          disabled={isActing}
                          className="px-4 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:text-neutral-900 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestOptionalMeal(actionOptionalMeal.id)}
                          disabled={isActing}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] disabled:bg-emerald-300 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isActing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Submitting Request...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Confirm Optional Meal Request</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                          <Utensils className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-oswald text-base font-bold uppercase text-neutral-900">
                            No Optional Meals Available for this Date
                          </h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                            There is no alternative meal configured for this weekday in your meal plan. Your regular chef-crafted
                            meal will be delivered as scheduled.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setActionView("choose")}
                          className="px-4 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:text-neutral-900 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Back to Options
                        </button>
                        <button
                          type="button"
                          onClick={closeActionModal}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          Keep Regular Meal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scheduled deliveries grouped by location */}
        {hasScheduledDates && (
          <div className="space-y-3 pt-1">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#28B454]" />
              <span>Scheduled Deliveries</span>
            </h4>
            <div className="space-y-2.5">
              {Object.entries(scheduledByLocation).map(([locId, dates]) => (
                <div key={locId} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#28B454] shrink-0" />
                    <span className="text-[11px] font-bold text-slate-800 truncate">{getLocationLabel(locId)}</span>
                    <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                      ({dates.length} day{dates.length === 1 ? "" : "s"})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dates.map((entry) => (
                      <span
                        key={entry.id || entry.date}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold",
                          entry.locked ? "bg-slate-700 text-white" : "bg-emerald-100 text-[#15803D] border border-emerald-300/80"
                        )}
                      >
                        {formatShortDate(entry.date)}
                        {entry.locked && <Lock className="w-2.5 h-2.5" />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

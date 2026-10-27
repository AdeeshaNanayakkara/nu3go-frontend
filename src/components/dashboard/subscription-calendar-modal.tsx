"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  Check,
  Utensils,
  ArrowRight,
  ArrowLeft,
  Info,
  Layers,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Ban,
  MessageSquare,
} from "lucide-react";
import type { SubscriptionResItem } from "@/services/api/subscription.service";
import {
  mealCancellationService,
  type MealCancellationRes,
} from "@/services/api/meal-cancellation.service";
import {
  optionalMealRequestService,
  type OptionalMealRequestRes,
} from "@/services/api/optional-meal-request.service";
import {
  packageService,
  type PublicPackage,
} from "@/services/api/package.service";

export interface SubscriptionCalendarViewProps {
  subscription: SubscriptionResItem | null;
  packageName?: string;
  planName?: string;
  planDurationLabel?: string;
  deliveryAddress?: string;
  onBackToOverview?: () => void;
  // Optional modal legacy props
  isOpen?: boolean;
  onClose?: () => void;
  isInline?: boolean;
}

// ─── Pure Date Helper Functions (Timezone-Safe) ───

function parseDateYMD(str?: string): Date | null {
  if (!str) return null;
  const clean = str.split("T")[0].trim();
  const parts = clean.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  const dt = new Date(str);
  return isNaN(dt.getTime()) ? null : dt;
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const PRESET_REASONS = [
  { label: "✈️ Travelling", value: "Travelling / Out of Town" },
  { label: "💼 Work Event", value: "Work Event / Office Lunch Provided" },
  { label: "🥗 Fasting / Diet", value: "Fasting / Personal Diet Preference" },
  { label: "🤒 Health / Unwell", value: "Health Issue / Medical Diet Adjustment" },
  { label: "🔄 Schedule Conflict", value: "Schedule Conflict / Not Available" },
  { label: "📝 Other Reason", value: "Other" },
];

export function SubscriptionCalendarView({
  subscription,
  packageName = "Chef-Crafted Meal Plan",
  planName = "Monthly Plan",
  planDurationLabel = "Monthly (20 Weekdays)",
  deliveryAddress = "Primary Address",
  onBackToOverview,
  isOpen = true,
  onClose,
  isInline = true,
}: SubscriptionCalendarViewProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Cancellation State
  const [cancellations, setCancellations] = useState<MealCancellationRes[]>([]);
  const [isLoadingCancellations, setIsLoadingCancellations] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Date Action Popup State (supports Cancel Meal & Optional Meal Request)
  const [actionModalDate, setActionModalDate] = useState<string | null>(null);
  const [actionModalView, setActionModalView] = useState<"choose" | "cancel" | "optional">("choose");

  // Optional Meal Requests State
  const [optionalRequests, setOptionalRequests] = useState<OptionalMealRequestRes[]>([]);
  const [isLoadingOptionalRequests, setIsLoadingOptionalRequests] = useState(false);
  const [isSubmittingOptional, setIsSubmittingOptional] = useState(false);
  const [optionalError, setOptionalError] = useState<string | null>(null);

  // Package & Menus State
  const [packageDetail, setPackageDetail] = useState<PublicPackage | null>(null);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);

  // Global Feedback Alert Message (for both cancellations & optional meal requests)
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);

  const handleBack = onBackToOverview || onClose;

  // Close action modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (actionModalDate) {
          setActionModalDate(null);
          setCancelError(null);
          setOptionalError(null);
        } else if (handleBack) {
          handleBack();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actionModalDate, handleBack]);

  // Fetch cancellations for this subscription
  useEffect(() => {
    if (!subscription?.id) return;
    let isMounted = true;
    setIsLoadingCancellations(true);

    mealCancellationService
      .getSubscriptionCancellations(subscription.id)
      .then((items) => {
        if (isMounted) {
          setCancellations(items || []);
        }
      })
      .catch((err) => {
        console.warn("[SubscriptionCalendarView] Error loading cancellations:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCancellations(false);
      });

    return () => {
      isMounted = false;
    };
  }, [subscription?.id]);

  // Fetch optional meal requests for this subscription
  useEffect(() => {
    if (!subscription?.id) return;
    let isMounted = true;
    setIsLoadingOptionalRequests(true);

    optionalMealRequestService
      .getSubscriptionRequests(subscription.id)
      .then((items) => {
        if (isMounted) {
          setOptionalRequests(items || []);
        }
      })
      .catch((err) => {
        console.warn("[SubscriptionCalendarView] Error loading optional meal requests:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingOptionalRequests(false);
      });

    return () => {
      isMounted = false;
    };
  }, [subscription?.id]);

  // Fetch package details (menus and meal slots) for this subscription
  const resolvedPackageId = subscription?.package_id || subscription?.package?.id;
  useEffect(() => {
    if (!resolvedPackageId) return;
    let isMounted = true;
    setIsLoadingPackage(true);

    packageService
      .getPublicPackageDetail(resolvedPackageId)
      .then((pkg) => {
        if (isMounted && pkg) {
          setPackageDetail(pkg);
        }
      })
      .catch((err) => {
        console.warn("[SubscriptionCalendarView] Error loading package detail:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPackage(false);
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedPackageId]);

  // Map of cancellations keyed by YYYY-MM-DD
  const cancellationsMap = useMemo(() => {
    const map = new Map<string, MealCancellationRes>();
    for (const c of cancellations) {
      if (c.delivery_date) {
        const ymd = c.delivery_date.split("T")[0];
        map.set(ymd, c);
      }
    }
    return map;
  }, [cancellations]);

  // Map of active optional meal requests keyed by YYYY-MM-DD
  const optionalRequestsMap = useMemo(() => {
    const map = new Map<string, OptionalMealRequestRes>();
    for (const req of optionalRequests) {
      if (req.delivery_date && !req.cancelled_at) {
        const ymd = req.delivery_date.split("T")[0];
        map.set(ymd, req);
      }
    }
    return map;
  }, [optionalRequests]);

  // Today reference
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const todayYMD = useMemo(() => formatYMD(today), [today]);

  // 1. Resolve Start Date & Due Date (Valid Until / Next Renewal)
  const { startDate, dueDate, isAutoCalculatedDue } = useMemo(() => {
    let start = parseDateYMD(subscription?.started_at || subscription?.created_at);
    let due = parseDateYMD(subscription?.valid_until || subscription?.next_billing_date);

    if (!start) {
      const fallbackStart = new Date(today);
      let count = 0;
      while (count < 14) {
        fallbackStart.setDate(fallbackStart.getDate() - 1);
        const dow = fallbackStart.getDay();
        if (dow >= 1 && dow <= 5) count++;
      }
      start = fallbackStart;
    }

    let autoCalc = false;
    if (!due || due.getTime() <= start.getTime()) {
      autoCalc = true;
      const targetDays = 20;
      const cursor = new Date(start);
      let count = 0;
      while (count < targetDays) {
        const dow = cursor.getDay();
        if (dow >= 1 && dow <= 5) count++;
        if (count < targetDays) cursor.setDate(cursor.getDate() + 1);
      }
      due = cursor;
    }

    return {
      startDate: start,
      dueDate: due,
      isAutoCalculatedDue: autoCalc,
    };
  }, [subscription, today]);

  const startYMD = useMemo(() => formatYMD(startDate), [startDate]);
  const dueYMD = useMemo(() => formatYMD(dueDate), [dueDate]);

  // 2. Resolve explicit delivery dates if stored in subscription.locations
  const explicitDatesSet = useMemo(() => {
    const set = new Set<string>();
    if (subscription?.locations && Array.isArray(subscription.locations)) {
      for (const loc of subscription.locations) {
        if (loc.date) set.add(loc.date.split("T")[0]);
        if (Array.isArray((loc as any).dates)) {
          for (const d of (loc as any).dates) {
            set.add(String(d).split("T")[0]);
          }
        }
      }
    }
    return set;
  }, [subscription]);

  // 3. Generate ALL Delivery Days between Start Date and Due Date
  const allPlanDates = useMemo(() => {
    const list: Array<{
      date: Date;
      dateStr: string;
      dayOfWeek: number;
      isWeekday: boolean;
      isDeliveryDay: boolean;
      status: "delivered" | "today" | "upcoming" | "weekend" | "cancelled";
      isCancelled: boolean;
      cancellation?: MealCancellationRes;
      isStart: boolean;
      isDue: boolean;
    }> = [];

    const cursor = new Date(startDate);
    const end = new Date(dueDate);

    while (cursor <= end) {
      const dStr = formatYMD(cursor);
      const dow = cursor.getDay();
      const isWeekday = dow >= 1 && dow <= 5;
      const isStart = dStr === startYMD;
      const isDue = dStr === dueYMD;

      const isDeliveryDay = explicitDatesSet.size > 0 ? explicitDatesSet.has(dStr) : isWeekday;
      const cancellation = cancellationsMap.get(dStr);
      const isCancelled = Boolean(cancellation);

      let status: "delivered" | "today" | "upcoming" | "weekend" | "cancelled" = "upcoming";
      if (isCancelled) {
        status = "cancelled";
      } else if (!isWeekday) {
        status = "weekend";
      } else if (dStr < todayYMD) {
        status = "delivered";
      } else if (dStr === todayYMD) {
        status = "today";
      } else {
        status = "upcoming";
      }

      list.push({
        date: new Date(cursor),
        dateStr: dStr,
        dayOfWeek: dow,
        isWeekday,
        isDeliveryDay,
        status,
        isCancelled,
        cancellation,
        isStart,
        isDue,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return list;
  }, [startDate, dueDate, startYMD, dueYMD, explicitDatesSet, todayYMD, cancellationsMap]);

  // Map of plan dates by dateStr for instant lookup
  const planDatesMap = useMemo(() => {
    const map = new Map<string, (typeof allPlanDates)[0]>();
    for (const item of allPlanDates) {
      map.set(item.dateStr, item);
    }
    return map;
  }, [allPlanDates]);

  // Stats calculation
  const totalDeliveryDays = useMemo(
    () => allPlanDates.filter((d) => d.isDeliveryDay).length,
    [allPlanDates]
  );
  const deliveredDaysCount = useMemo(
    () => allPlanDates.filter((d) => d.isDeliveryDay && d.status === "delivered" && !d.isCancelled).length,
    [allPlanDates]
  );
  const cancelledDaysCount = useMemo(
    () => allPlanDates.filter((d) => d.isDeliveryDay && d.isCancelled).length,
    [allPlanDates]
  );
  const remainingDaysCount = useMemo(
    () =>
      allPlanDates.filter(
        (d) =>
          d.isDeliveryDay &&
          !d.isCancelled &&
          (d.status === "upcoming" || d.status === "today")
      ).length,
    [allPlanDates]
  );

  // 4. Calendar Month View Controller
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Reset focus when subscription changes
  useEffect(() => {
    const initialMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonthDate(initialMonth);
    // If today is a weekend, default to upcoming Monday
    const dow = today.getDay();
    let initialSelect = todayYMD;
    if (dow === 6) {
      const mon = new Date(today);
      mon.setDate(mon.getDate() + 2);
      initialSelect = formatYMD(mon);
    } else if (dow === 0) {
      const mon = new Date(today);
      mon.setDate(mon.getDate() + 1);
      initialSelect = formatYMD(mon);
    }
    setSelectedDateStr(initialSelect);
    setFeedbackSuccessMsg(null);
    setActionModalDate(null);
    setCancelError(null);
    setOptionalError(null);
  }, [subscription?.id, today, todayYMD]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToStart = () => {
    setCurrentMonthDate(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
    setSelectedDateStr(startYMD);
  };

  const handleJumpToDue = () => {
    setCurrentMonthDate(new Date(dueDate.getFullYear(), dueDate.getMonth(), 1));
    setSelectedDateStr(dueYMD);
  };

  const handleJumpToToday = () => {
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const dow = today.getDay();
    let target = todayYMD;
    if (dow === 6) {
      const mon = new Date(today);
      mon.setDate(mon.getDate() + 2);
      target = formatYMD(mon);
    } else if (dow === 0) {
      const mon = new Date(today);
      mon.setDate(mon.getDate() + 1);
      target = formatYMD(mon);
    }
    setSelectedDateStr(target);
  };

  // 5. Construct 5-column Weekday Calendar Grid (Mon to Fri) for Current Month
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Calculate start day of grid (align to Monday)
    const firstDow = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const startGridDate = new Date(firstDayOfMonth);
    if (firstDow === 0) {
      startGridDate.setDate(startGridDate.getDate() + 1);
    } else if (firstDow === 6) {
      startGridDate.setDate(startGridDate.getDate() + 2);
    } else if (firstDow > 1) {
      startGridDate.setDate(startGridDate.getDate() - (firstDow - 1));
    }

    // Calculate end day of grid (align to Friday)
    const lastDow = lastDayOfMonth.getDay();
    const endGridDate = new Date(lastDayOfMonth);
    if (lastDow === 0) {
      endGridDate.setDate(endGridDate.getDate() - 2);
    } else if (lastDow === 6) {
      endGridDate.setDate(endGridDate.getDate() - 1);
    } else if (lastDow < 5) {
      endGridDate.setDate(endGridDate.getDate() + (5 - lastDow));
    }

    const cells: Array<{
      date: Date;
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      planItem?: (typeof allPlanDates)[0];
    }> = [];

    const cursor = new Date(startGridDate);
    while (cursor <= endGridDate) {
      const dow = cursor.getDay();
      // Skip Saturday (6) and Sunday (0)
      if (dow === 6) {
        cursor.setDate(cursor.getDate() + 2);
        continue;
      }
      if (dow === 0) {
        cursor.setDate(cursor.getDate() + 1);
        continue;
      }

      const dStr = formatYMD(cursor);
      const planItem = planDatesMap.get(dStr);

      cells.push({
        date: new Date(cursor),
        dateStr: dStr,
        dayNum: cursor.getDate(),
        isCurrentMonth: cursor.getMonth() === month,
        planItem,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return cells;
  }, [year, month, planDatesMap]);

  // Selected date info
  const selectedInfo = useMemo(() => {
    if (!selectedDateStr) return null;
    const planItem = planDatesMap.get(selectedDateStr);
    const parsed = parseDateYMD(selectedDateStr);
    if (!parsed) return null;

    const dow = parsed.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isInsideCycle = selectedDateStr >= startYMD && selectedDateStr <= dueYMD;
    const isCancelled = Boolean(planItem?.isCancelled);
    const isPast = Boolean(planItem?.status === "delivered");
    const isCancellable =
      Boolean(subscription?.id) &&
      isInsideCycle &&
      !isWeekend &&
      !isCancelled &&
      !isPast;

    return {
      dateStr: selectedDateStr,
      date: parsed,
      isWeekend,
      isInsideCycle,
      planItem,
      isCancelled,
      isPast,
      isCancellable,
      cancellation: planItem?.cancellation,
      displayDate: formatDisplayDate(parsed),
    };
  }, [selectedDateStr, planDatesMap, startYMD, dueYMD, subscription?.id]);

  // Grouped weeks for List View
  const listWeeks = useMemo(() => {
    const deliveryDaysOnly = allPlanDates.filter((d) => d.isDeliveryDay);
    const weeks: Array<{
      weekNumber: number;
      dates: typeof deliveryDaysOnly;
    }> = [];

    let currentWeek: typeof deliveryDaysOnly = [];
    let weekIndex = 1;

    for (let i = 0; i < deliveryDaysOnly.length; i++) {
      const item = deliveryDaysOnly[i];
      currentWeek.push(item);

      if (item.dayOfWeek === 5 || i === deliveryDaysOnly.length - 1) {
        weeks.push({
          weekNumber: weekIndex++,
          dates: currentWeek,
        });
        currentWeek = [];
      }
    }

    return weeks;
  }, [allPlanDates]);

  // Resolve available optional meal for a specific date from package menus
  const getOptionalMealForDate = (dateStr: string) => {
    const availableMenus = packageDetail?.menus || (subscription?.package as any)?.menus;
    if (!availableMenus || !Array.isArray(availableMenus) || availableMenus.length === 0) return null;
    const parsed = parseDateYMD(dateStr);
    if (!parsed) return null;

    const dow = parsed.getDay();
    const dayNames: ("SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY")[] = [
      "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"
    ];
    const weekdayName = dayNames[dow];
    if (dow < 1 || dow > 5) return null;

    // Delivery index among scheduled delivery weekdays in plan
    const deliveryDays = allPlanDates.filter((d) => d.isDeliveryDay);
    const deliveryIndex = deliveryDays.findIndex((d) => d.dateStr === dateStr);
    const weekIndex = deliveryIndex >= 0 ? Math.floor(deliveryIndex / 5) : 0;

    const menus = [...availableMenus].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    const activeMenu = menus[weekIndex % menus.length] || menus[0];

    if (!activeMenu?.meals || !Array.isArray(activeMenu.meals)) return null;
    const slot = activeMenu.meals.find(
      (m: any) => m.day && String(m.day).toUpperCase() === weekdayName
    );
    if (!slot) return null;

    const optMealObj = slot.optional_meal;
    const optMealId = optMealObj?.id || slot.optional_meal_id;
    if (optMealId) {
      return {
        id: String(optMealId),
        name: optMealObj?.name || "Chef's Daily Alternative",
        description: optMealObj?.description,
        image_url: optMealObj?.image_url,
      };
    }
    return null;
  };

  // Open Date Action Dialog (defaulting to choose between Cancel Meal & Optional Meal Request)
  const handleOpenActionModal = (
    dateStr: string,
    initialView: "choose" | "cancel" | "optional" = "choose"
  ) => {
    setActionModalDate(dateStr);
    setActionModalView(initialView);
    setSelectedDateStr(dateStr);
    setCancelReason("");
    setSelectedChip(null);
    setCancelError(null);
    setOptionalError(null);
  };

  // Select quick reason chip for cancellation
  const handleSelectChip = (chip: { label: string; value: string }) => {
    setSelectedChip(chip.label);
    if (chip.value !== "Other") {
      setCancelReason(chip.value);
    } else {
      setCancelReason("");
    }
  };

  // Submit cancellation to POST /api/v1/meal-cancellations
  const handleConfirmCancelMeal = async () => {
    if (!actionModalDate || !subscription?.id) {
      setCancelError("Subscription details or date are missing.");
      return;
    }

    const finalReason = cancelReason.trim();
    if (!finalReason) {
      setCancelError("Please select or enter a cancellation reason.");
      return;
    }

    setIsSubmittingCancel(true);
    setCancelError(null);

    try {
      const result = await mealCancellationService.cancelMeal({
        subscription_id: subscription.id,
        delivery_date: actionModalDate,
        reason: finalReason,
      });

      const newRecord: MealCancellationRes = {
        id: result?.id || `cancel-${Date.now()}`,
        subscription_id: subscription.id,
        delivery_date: actionModalDate,
        reason: finalReason,
        refund_amount: result?.refund_amount,
        refund_tier: result?.refund_tier,
        created_at: result?.created_at || new Date().toISOString(),
      };

      setCancellations((prev) => [
        ...prev.filter((c) => c.delivery_date.split("T")[0] !== actionModalDate),
        newRecord,
      ]);

      const parsedCancelDate = parseDateYMD(actionModalDate);
      setFeedbackSuccessMsg(
        `Meal delivery for ${parsedCancelDate ? formatDisplayDate(parsedCancelDate) : actionModalDate} was cancelled successfully.`
      );
      setActionModalDate(null);
      setCancelReason("");
      setSelectedChip(null);
    } catch (err: any) {
      console.error("[SubscriptionCalendarView] Meal cancellation error:", err);
      const msg =
        err?.message ||
        err?.error?.message ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Could not cancel meal delivery. Please try again or contact support.";
      setCancelError(msg);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Submit optional meal request to POST /api/v1/optional-meal-requests
  const handleRequestOptionalMeal = async (mealId: string) => {
    if (!actionModalDate || !subscription?.id) {
      setOptionalError("Subscription details or date are missing.");
      return;
    }

    if (!mealId) {
      setOptionalError("Meal ID is missing for this optional meal request.");
      return;
    }

    const cleanDate = actionModalDate.split("T")[0].trim();

    setIsSubmittingOptional(true);
    setOptionalError(null);

    try {
      const result = await optionalMealRequestService.createRequest({
        subscription_id: subscription.id,
        delivery_date: cleanDate,
        meal_id: mealId,
      });

      const newRecord: OptionalMealRequestRes = {
        id: result?.id || `opt-${Date.now()}`,
        subscription_id: subscription.id,
        delivery_date: cleanDate,
        meal_id: mealId,
        created_at: result?.created_at || new Date().toISOString(),
      };

      setOptionalRequests((prev) => [
        ...prev.filter((r) => r.delivery_date.split("T")[0] !== cleanDate),
        newRecord,
      ]);

      const parsedDate = parseDateYMD(cleanDate);
      setFeedbackSuccessMsg(
        `Optional meal requested successfully for ${parsedDate ? formatDisplayDate(parsedDate) : cleanDate}.`
      );
      setActionModalDate(null);

      // Re-sync with backend in background to ensure all fields are fresh
      optionalMealRequestService
        .getSubscriptionRequests(subscription.id)
        .then((items) => {
          if (items && items.length > 0) {
            setOptionalRequests(items);
          }
        })
        .catch(() => {});
    } catch (err: any) {
      console.error("[SubscriptionCalendarView] Optional meal request error:", err);
      const msg =
        err?.message ||
        err?.error?.message ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Could not submit optional meal request. Please try again.";
      setOptionalError(msg);
    } finally {
      setIsSubmittingOptional(false);
    }
  };

  // Cancel an existing optional meal request via POST /api/v1/optional-meal-requests/{id}/cancel
  const handleCancelOptionalMeal = async (requestId: string) => {
    if (!actionModalDate) return;
    setIsSubmittingOptional(true);
    setOptionalError(null);

    try {
      await optionalMealRequestService.cancelRequest(requestId);

      setOptionalRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, cancelled_at: new Date().toISOString() }
            : r
        )
      );

      const parsedDate = parseDateYMD(actionModalDate);
      setFeedbackSuccessMsg(
        `Optional meal request for ${parsedDate ? formatDisplayDate(parsedDate) : actionModalDate} cancelled. Standard meal restored.`
      );
      setActionModalDate(null);
    } catch (err: any) {
      console.error("[SubscriptionCalendarView] Cancel optional request error:", err);
      const msg =
        err?.message ||
        err?.error?.message ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Could not cancel optional meal request.";
      setOptionalError(msg);
    } finally {
      setIsSubmittingOptional(false);
    }
  };

  if (!isInline && !isOpen) return null;

  const content = (
    <div
      className="relative w-full bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden animate-in fade-in duration-200 font-poppins"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ─── Top Bar / Header ─── */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-900 via-neutral-900 to-emerald-950 text-white relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#36D068]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-[#36D068] bg-[#36D068]/20 border border-[#36D068]/40 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#36D068] animate-ping" />
                Active Subscription Schedule
              </span>
              <span className="text-xs text-white/60 font-mono">
                Cycle: {formatShortDate(startDate)} – {formatShortDate(dueDate)}
              </span>
              {isLoadingCancellations && (
                <span className="text-[11px] text-white/50 inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-[#36D068]" /> Syncing schedule...
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-tight">
                {packageName}
              </h2>
              <p className="text-xs sm:text-sm text-white/80 font-normal">
                {planName || planDurationLabel} • Scheduled Weekday Delivery Calendar (Start to Due Date)
              </p>
            </div>
          </div>

          {/* Back to Plan Summary Action */}
          {handleBack && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all cursor-pointer self-start sm:self-center border border-white/15 active:scale-95 shadow-sm"
              aria-label="Back to plan overview"
            >
              <ArrowLeft className="w-4 h-4 text-[#36D068]" />
              <span>Back to Plan Summary</span>
            </button>
          )}
        </div>

        {/* ─── Metric Pills Bar ─── */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-5 mt-4 border-t border-white/10">
          {/* Start Date */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">
              Start Date
            </span>
            <span className="font-oswald text-sm sm:text-base font-bold text-white uppercase tracking-wide block truncate">
              {formatShortDate(startDate)}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Activated
            </span>
          </div>

          {/* Due / Renewal Date */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">
              Due Date
            </span>
            <span className="font-oswald text-sm sm:text-base font-bold text-white uppercase tracking-wide block truncate">
              {formatShortDate(dueDate)}
            </span>
            <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> Cycle Due
            </span>
          </div>

          {/* Delivered Meals */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">
              Delivered
            </span>
            <span className="font-oswald text-sm sm:text-base font-bold text-[#36D068] uppercase tracking-wide block truncate">
              {deliveredDaysCount} of {totalDeliveryDays}
            </span>
            <span className="text-[10px] text-white/60 font-medium block mt-0.5">
              {Math.round((deliveredDaysCount / Math.max(1, totalDeliveryDays)) * 100)}% Complete
            </span>
          </div>

          {/* Cancelled Meals */}
          <div className={`rounded-2xl p-2.5 sm:p-3 border transition-colors ${cancelledDaysCount > 0 ? "bg-rose-500/15 border-rose-400/30" : "bg-white/5 border-white/10"}`}>
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">
              Cancelled
            </span>
            <span className={`font-oswald text-sm sm:text-base font-bold uppercase tracking-wide block truncate ${cancelledDaysCount > 0 ? "text-rose-300" : "text-white"}`}>
              {cancelledDaysCount} Meal{cancelledDaysCount === 1 ? "" : "s"}
            </span>
            <span className="text-[10px] text-rose-300/80 font-medium block mt-0.5">
              {cancelledDaysCount > 0 ? "Refunded / Skipped" : "No skips yet"}
            </span>
          </div>

          {/* Remaining Meals */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 sm:p-3 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-medium block">
              Remaining Active
            </span>
            <span className="font-oswald text-sm sm:text-base font-bold text-cyan-300 uppercase tracking-wide block truncate">
              {remainingDaysCount} Weekday{remainingDaysCount === 1 ? "" : "s"}
            </span>
            <span className="text-[10px] text-white/60 font-medium block mt-0.5">
              Scheduled ahead
            </span>
          </div>
        </div>
      </div>

      {/* ─── Success Feedback Alert ─── */}
      {feedbackSuccessMsg && (
        <div className="mx-5 sm:mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300/80 text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>{feedbackSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Body ─── */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* View Toggle Bar (Calendar vs Full List) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-oswald text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-slate-600 hover:text-neutral-900"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Calendar View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-oswald text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-slate-600 hover:text-neutral-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#15803D]" />
              <span>All Delivery Dates ({totalDeliveryDays})</span>
            </button>
          </div>

          {/* Quick Navigation Jump Buttons (Calendar Mode) */}
          {viewMode === "calendar" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleJumpToStart}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-[11px] font-oswald font-bold uppercase tracking-wide text-slate-700 transition-all cursor-pointer"
              >
                Start: {formatShortDate(startDate)}
              </button>
              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[11px] font-oswald font-bold uppercase tracking-wide text-[#15803D] border border-emerald-200 transition-all cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleJumpToDue}
                className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-[11px] font-oswald font-bold uppercase tracking-wide text-amber-800 border border-amber-200 transition-all cursor-pointer"
              >
                Due: {formatShortDate(dueDate)}
              </button>
            </div>
          )}
        </div>

        {/* ─── VIEW 1: CALENDAR GRID ─── */}
        {viewMode === "calendar" && (
          <div className="space-y-4">
            {/* Calendar Container */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-50/70 border border-slate-200/90 shadow-2xs space-y-4">
              {/* Month Navigation Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-oswald text-lg sm:text-xl font-black uppercase text-neutral-900 tracking-wide">
                    {currentMonthDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Select any date to view meal details or request a cancellation.
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

              {/* 5-Day Header (Mon - Fri) */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center font-oswald text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200/70">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
              </div>

              {/* 5-Day Calendar Cells Grid */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {calendarGrid.map((cell, idx) => {
                  const isSelected = selectedDateStr === cell.dateStr;
                  const isInsideCycle = cell.dateStr >= startYMD && cell.dateStr <= dueYMD;
                  const planItem = cell.planItem;
                  const isDelivery = Boolean(planItem?.isDeliveryDay);
                  const isToday = cell.dateStr === todayYMD;
                  const isStart = cell.dateStr === startYMD;
                  const isDue = cell.dateStr === dueYMD;
                  const isCancelled = Boolean(planItem?.isCancelled);
                  const isPast = planItem?.status === "delivered";
                  const hasOptionalReq = optionalRequestsMap.has(cell.dateStr);
                  const isNotDeliveredDate =
                    Boolean(subscription?.id) &&
                    cell.isCurrentMonth &&
                    isInsideCycle &&
                    isDelivery &&
                    !isCancelled &&
                    !isPast;

                  let cellBg = "bg-white/40 text-slate-400 border border-transparent";

                  if (!cell.isCurrentMonth) {
                    cellBg = "opacity-30 bg-slate-100/50 text-slate-400 border border-transparent";
                  } else if (isCancelled) {
                    cellBg = "bg-rose-50/90 hover:bg-rose-100 text-rose-800 border border-rose-300/90 shadow-2xs font-semibold";
                  } else if (hasOptionalReq) {
                    cellBg = "bg-purple-50/90 hover:bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs font-semibold";
                  } else if (isDelivery) {
                    if (isToday) {
                      cellBg = "bg-emerald-50 text-neutral-900 border-2 border-[#36D068] shadow-md shadow-[#36D068]/20 ring-2 ring-[#36D068]/20 font-black";
                    } else if (isPast) {
                      cellBg = "bg-emerald-100/60 hover:bg-emerald-100 text-[#15803D] border border-emerald-300/80";
                    } else {
                      cellBg = "bg-white hover:bg-emerald-50/60 text-neutral-900 border border-emerald-200/90 shadow-2xs";
                    }
                  } else if (isInsideCycle) {
                    cellBg = "bg-slate-50 text-slate-600 border border-slate-200/60";
                  } else {
                    cellBg = "bg-white text-slate-500 border border-slate-200/50";
                  }

                  if (isSelected) {
                    cellBg += " ring-2 ring-neutral-900 scale-[1.03] shadow-md z-10";
                  }

                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedDateStr(cell.dateStr);
                        if (isNotDeliveredDate) {
                          handleOpenActionModal(cell.dateStr, "choose");
                        }
                      }}
                      className={`h-14 sm:h-16 rounded-2xl p-1 sm:p-1.5 transition-all flex flex-col justify-between items-center relative cursor-pointer ${cellBg}`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span
                          className={`text-xs sm:text-sm font-oswald leading-none ${
                            isCancelled
                              ? "line-through decoration-rose-500 text-rose-700 font-bold"
                              : isDelivery
                              ? "font-bold"
                              : "font-medium"
                          }`}
                        >
                          {cell.dayNum}
                        </span>

                        {isCancelled ? (
                          <CalendarX className="w-3 h-3 text-rose-600" />
                        ) : hasOptionalReq ? (
                          <Sparkles className="w-3 h-3 text-purple-600" />
                        ) : isDelivery ? (
                          <span>
                            {isPast ? (
                              <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                            ) : isToday ? (
                              <span className="w-2 h-2 rounded-full bg-[#36D068] animate-ping" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#36D068]" />
                            )}
                          </span>
                        ) : null}
                      </div>

                      <div className="w-full flex justify-center">
                        {isCancelled ? (
                          <span className="font-oswald text-[8px] sm:text-[9px] font-bold uppercase px-1 py-0.2 rounded-md bg-rose-600 text-white">
                            Cancelled
                          </span>
                        ) : hasOptionalReq ? (
                          <span className="font-oswald text-[8px] sm:text-[9px] font-bold uppercase px-1 py-0.2 rounded-md bg-purple-600 text-white flex items-center gap-0.5">
                            <Sparkles className="w-2 h-2 text-amber-300" /> Optional
                          </span>
                        ) : isStart ? (
                          <span className="font-oswald text-[8px] sm:text-[9px] font-bold uppercase px-1 py-0.2 rounded-md bg-[#15803D] text-white">
                            Start
                          </span>
                        ) : isDue ? (
                          <span className="font-oswald text-[8px] sm:text-[9px] font-bold uppercase px-1 py-0.2 rounded-md bg-amber-500 text-black">
                            Due
                          </span>
                        ) : isToday ? (
                          <span className="font-oswald text-[8px] sm:text-[9px] font-bold uppercase px-1 py-0.2 rounded-md bg-[#36D068] text-black">
                            Today
                          </span>
                        ) : isDelivery ? (
                          <span className="text-[8px] sm:text-[9px] text-[#15803D] font-medium hidden sm:inline">
                            {isPast ? "Delivered" : "Delivery"}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 px-2">
              <div className="flex items-center gap-3.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 inline-block" />
                  <span>Delivered ({deliveredDaysCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-50 border-2 border-[#36D068] inline-block" />
                  <span>Today's Meal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-white border border-emerald-200 inline-block" />
                  <span>Upcoming ({remainingDaysCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-purple-100 border border-purple-300 inline-block" />
                  <span className="text-purple-700 font-medium">Optional Meal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300 inline-block" />
                  <span className="text-rose-700 font-medium">Cancelled ({cancelledDaysCount})</span>
                </div>
              </div>

              <span className="font-oswald font-bold text-slate-500 uppercase tracking-wide">
                Mon – Fri 7:00 – 8:30 AM
              </span>
            </div>

            {/* Selected Date Detail Banner */}
            {selectedInfo && (
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${
                  selectedInfo.isCancelled
                    ? "bg-rose-50/70 border-rose-200 text-rose-950"
                    : optionalRequestsMap.has(selectedInfo.dateStr)
                    ? "bg-purple-50/70 border-purple-200 text-purple-950"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-oswald text-sm font-bold uppercase tracking-wider text-neutral-900">
                      {selectedInfo.displayDate}
                    </span>

                    {selectedInfo.isCancelled ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-oswald text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Meal Delivery Cancelled
                      </span>
                    ) : optionalRequestsMap.has(selectedInfo.dateStr) ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-oswald text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-300" /> Optional Meal Requested
                      </span>
                    ) : selectedInfo.planItem?.isDeliveryDay ? (
                      selectedInfo.planItem.status === "delivered" ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#15803D] font-oswald text-[10px] font-bold uppercase tracking-wider">
                          ✓ Delivered
                        </span>
                      ) : selectedInfo.planItem.status === "today" ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#36D068] text-black font-oswald text-[10px] font-bold uppercase tracking-wider">
                          ● Out for Delivery Today
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-oswald text-[10px] font-bold uppercase tracking-wider">
                          Scheduled Weekday Meal
                        </span>
                      )
                    ) : selectedInfo.isWeekend ? (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-oswald text-[10px] font-bold uppercase tracking-wider">
                        Weekend • No Delivery
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-oswald text-[10px] font-bold uppercase tracking-wider">
                        Outside Active Cycle
                      </span>
                    )}

                    {selectedInfo.planItem?.isStart && (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white font-oswald text-[10px] font-bold uppercase tracking-wider">
                        Cycle Start
                      </span>
                    )}
                    {selectedInfo.planItem?.isDue && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-oswald text-[10px] font-bold uppercase tracking-wider">
                        Cycle Due / Renewal
                      </span>
                    )}
                  </div>

                  {selectedInfo.isCancelled ? (
                    <div className="space-y-1">
                      <p className="text-xs text-rose-800 font-medium flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>
                          <strong>Reason:</strong>{" "}
                          {selectedInfo.cancellation?.reason || "Customer requested cancellation"}
                        </span>
                      </p>
                      {selectedInfo.cancellation?.refund_tier && (
                        <p className="text-[11px] text-rose-700 font-medium">
                          Refund Tier:{" "}
                          <span className="font-semibold uppercase">
                            {selectedInfo.cancellation.refund_tier}
                          </span>
                          {typeof selectedInfo.cancellation?.refund_amount === "number" && (
                            <span> • Amount: LKR {selectedInfo.cancellation.refund_amount.toLocaleString()}</span>
                          )}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-2 flex-wrap">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Delivery window: 7:00 AM – 8:30 AM</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-xs">{deliveryAddress}</span>
                    </p>
                  )}
                </div>

                {/* Actions for Selected Date */}
                <div className="shrink-0 flex items-center gap-2">
                  {selectedInfo.isCancelled ? (
                    <span className="text-xs font-oswald font-bold uppercase tracking-wide text-rose-700 bg-rose-100/80 border border-rose-300 px-3 py-1.5 rounded-xl">
                      Cancellation Logged
                    </span>
                  ) : selectedInfo.isCancellable ? (
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(selectedInfo.dateStr, "choose")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                    >
                      <Utensils className="w-4 h-4 text-[#36D068]" />
                      <span>Meal Options (Cancel / Optional)</span>
                    </button>
                  ) : selectedInfo.isPast ? (
                    <span className="text-xs font-oswald font-bold uppercase tracking-wide text-[#15803D] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      Meal Delivered
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── VIEW 2: ALL DATES LIST (Chronological from Start to Due) ─── */}
        {viewMode === "list" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-oswald text-base font-bold uppercase text-neutral-900">
                  All {totalDeliveryDays} Scheduled Delivery Dates
                </h4>
                <p className="text-xs text-slate-500">
                  Chronological plan dates from Start ({formatDisplayDate(startDate)}) to Due ({formatDisplayDate(dueDate)})
                </p>
              </div>
              <div className="text-right flex items-center gap-2">
                <span className="font-oswald text-xs font-bold uppercase tracking-wider text-[#15803D] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {deliveredDaysCount} Delivered
                </span>
                {cancelledDaysCount > 0 && (
                  <span className="font-oswald text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    {cancelledDaysCount} Cancelled
                  </span>
                )}
                <span className="font-oswald text-xs font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                  {remainingDaysCount} Remaining
                </span>
              </div>
            </div>

            {/* Weeks List */}
            <div className="space-y-5">
              {listWeeks.map((week) => (
                <div key={week.weekNumber} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      Week {week.weekNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({formatShortDate(week.dates[0].date)} – {formatShortDate(week.dates[week.dates.length - 1].date)})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {week.dates.map((d) => {
                      const isCancelled = d.isCancelled;
                      const isPast = d.status === "delivered";
                      const isToday = d.status === "today";
                      const isUpcoming = d.status === "upcoming";
                      const isCancellable =
                        Boolean(subscription?.id) &&
                        !isCancelled &&
                        !isPast &&
                        (isUpcoming || isToday);

                      return (
                        <div
                          key={d.dateStr}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isCancelled
                              ? "bg-rose-50/70 border-rose-200 text-rose-950"
                              : isToday
                              ? "bg-emerald-50/80 border-[#36D068] shadow-sm ring-1 ring-[#36D068]/30"
                              : isPast
                              ? "bg-emerald-50/40 border-emerald-200/80 text-slate-700"
                              : "bg-white border-slate-200 hover:border-slate-300 text-neutral-900 shadow-2xs"
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`font-oswald text-xs font-bold uppercase tracking-wide ${
                                  isCancelled ? "line-through text-rose-800" : ""
                                }`}
                              >
                                {formatDisplayDate(d.date)}
                              </span>
                              {d.isStart && (
                                <span className="text-[9px] font-oswald uppercase font-bold px-1.5 py-0.2 rounded-md bg-neutral-900 text-white">
                                  Start
                                </span>
                              )}
                              {d.isDue && (
                                <span className="text-[9px] font-oswald uppercase font-bold px-1.5 py-0.2 rounded-md bg-amber-500 text-black">
                                  Due
                                </span>
                              )}
                            </div>

                            {isCancelled ? (
                              <span className="text-[11px] text-rose-700 font-medium truncate block">
                                {d.cancellation?.reason || "Cancelled"}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                7:00 AM – 8:30 AM
                              </span>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {isCancelled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600 text-white font-oswald text-[10px] font-bold uppercase tracking-wider">
                                <Ban className="w-3 h-3" /> Cancelled
                              </span>
                            ) : optionalRequestsMap.has(d.dateStr) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600 text-white font-oswald text-[10px] font-bold uppercase tracking-wider">
                                <Sparkles className="w-3 h-3 text-amber-300" /> Optional
                              </span>
                            ) : isPast ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-[#15803D] font-oswald text-[10px] font-bold uppercase tracking-wider">
                                <Check className="w-3 h-3" /> Delivered
                              </span>
                            ) : isToday ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#36D068] text-black font-oswald text-[10px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" /> Today
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-oswald text-[10px] font-bold uppercase tracking-wider">
                                Scheduled
                              </span>
                            )}

                            {isCancellable && (
                              <button
                                type="button"
                                onClick={() => handleOpenActionModal(d.dateStr, "choose")}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-neutral-900 hover:text-white text-slate-700 transition-all text-[11px] font-oswald font-bold uppercase tracking-wider cursor-pointer border border-slate-200"
                                title="Manage delivery options for this date"
                              >
                                <Utensils className="w-3 h-3 text-[#15803D]" />
                                <span>Options</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer ─── */}
      <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-[#15803D] shrink-0" />
          <span>
            All weekday meals are cooked fresh daily. Meal cancellations apply per kitchen preparation guidelines.
          </span>
        </div>

        {handleBack && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-oswald text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[#36D068]" />
            <span>Back to Plan Summary</span>
          </button>
        )}
      </div>

      {/* ─── DATE ACTION MODAL (Cancel Meal & Optional Meal Request) ─── */}
      {actionModalDate && (
        <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 font-poppins max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                    actionModalView === "cancel"
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : actionModalView === "optional"
                      ? "bg-purple-50 border-purple-200 text-purple-600"
                      : "bg-emerald-50 border-emerald-200 text-[#15803D]"
                  }`}
                >
                  {actionModalView === "cancel" ? (
                    <CalendarX className="w-5 h-5" />
                  ) : actionModalView === "optional" ? (
                    <Sparkles className="w-5 h-5" />
                  ) : (
                    <Utensils className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-oswald text-xl font-bold uppercase text-neutral-900 tracking-tight">
                    {actionModalView === "cancel"
                      ? "Cancel Meal Delivery"
                      : actionModalView === "optional"
                      ? "Optional Meal Request"
                      : "Meal Delivery Options"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Delivery Date:{" "}
                    <strong className="text-neutral-900 font-semibold">
                      {parseDateYMD(actionModalDate)
                        ? formatDisplayDate(parseDateYMD(actionModalDate)!)
                        : actionModalDate}
                    </strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActionModalDate(null);
                  setCancelError(null);
                  setOptionalError(null);
                }}
                disabled={isSubmittingCancel || isSubmittingOptional}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step / Option Switcher (when inside Cancel or Optional view) */}
            {actionModalView !== "choose" && (
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setActionModalView("choose");
                    setCancelError(null);
                    setOptionalError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-oswald font-bold uppercase tracking-wider text-slate-500 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose Another Option</span>
                </button>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px] font-oswald font-bold uppercase">
                  <button
                    type="button"
                    onClick={() => setActionModalView("cancel")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      actionModalView === "cancel"
                        ? "bg-white text-rose-700 shadow-2xs"
                        : "text-slate-500 hover:text-neutral-900"
                    }`}
                  >
                    Cancel Meal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionModalView("optional")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      actionModalView === "optional"
                        ? "bg-white text-purple-700 shadow-2xs"
                        : "text-slate-500 hover:text-neutral-900"
                    }`}
                  >
                    Optional Meal
                  </button>
                </div>
              </div>
            )}

            {/* ─── OPTION SELECTION VIEW (Choose Between Cancel or Optional) ─── */}
            {actionModalView === "choose" && (
              <div className="space-y-3.5 py-1">
                <p className="text-xs text-slate-600 font-medium">
                  Please select an action for this scheduled delivery date:
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {/* Option 1: Cancel Meal */}
                  <button
                    type="button"
                    onClick={() => {
                      setActionModalView("cancel");
                      setCancelError(null);
                    }}
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50/50 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer shadow-2xs hover:shadow-md"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform">
                        <CalendarX className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-oswald text-base font-bold uppercase text-neutral-900 group-hover:text-rose-700 transition-colors">
                          Cancel Meal Delivery
                        </h4>
                        <p className="text-xs text-slate-500">
                          Skip meal delivery for this date. Kitchen cutoff rules and policy apply.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>

                  {/* Option 2: Optional Meal Request */}
                  <button
                    type="button"
                    onClick={() => {
                      setActionModalView("optional");
                      setOptionalError(null);
                    }}
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/50 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer shadow-2xs hover:shadow-md"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0 group-hover:scale-105 transition-transform">
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

            {/* ─── OPTION 1 CONTENT: CANCEL MEAL DELIVERY ─── */}
            {actionModalView === "cancel" && (
              <div className="space-y-4">
                {/* Informational Notice */}
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      Meal prep is planned in advance. Cancelling skips this delivery date and applies refund/credit per your subscription policy.
                    </p>
                  </div>
                </div>

                {/* Reason Selector Chips */}
                <div className="space-y-2">
                  <label className="block text-xs font-oswald font-bold uppercase tracking-wider text-slate-700">
                    Select a Reason:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_REASONS.map((chip) => {
                      const isSelected = selectedChip === chip.label;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => handleSelectChip(chip)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-neutral-900 text-white shadow-xs font-semibold"
                              : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60"
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Reason Textarea */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="cancel-reason-input"
                    className="block text-xs font-oswald font-bold uppercase tracking-wider text-slate-700"
                  >
                    Cancellation Reason / Comments: <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="cancel-reason-input"
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Traveling out of town for business trip..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-neutral-900 focus:outline-hidden text-xs sm:text-sm text-neutral-900 placeholder:text-slate-400 transition-all resize-none"
                    disabled={isSubmittingCancel}
                  />
                </div>

                {/* Error Message */}
                {cancelError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{cancelError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActionModalView("choose")}
                    disabled={isSubmittingCancel}
                    className="px-4 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:text-neutral-900 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Back to Options
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCancelMeal}
                    disabled={isSubmittingCancel || !cancelReason.trim()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmittingCancel ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <CalendarX className="w-4 h-4" />
                        <span>Confirm Cancellation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ─── OPTION 2 CONTENT: OPTIONAL MEAL REQUEST ─── */}
            {actionModalView === "optional" && (
              <div className="space-y-4">
                {/* Optional Request Error */}
                {optionalError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{optionalError}</span>
                  </div>
                )}

                {/* Scenario A: An active optional meal request already exists on this date */}
                {optionalRequestsMap.get(actionModalDate) ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <h4 className="font-oswald text-sm font-bold uppercase tracking-wide text-purple-900">
                          Optional Meal Request Active
                        </h4>
                      </div>
                      <p className="text-xs text-purple-800 leading-relaxed">
                        You have already submitted an optional meal request for this date. The kitchen will prepare the chef&apos;s alternative dish instead of your regular meal.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActionModalView("choose")}
                        className="px-4 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:text-neutral-900 hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const req = optionalRequestsMap.get(actionModalDate);
                          if (req?.id) handleCancelOptionalMeal(req.id);
                        }}
                        disabled={isSubmittingOptional}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isSubmittingOptional ? (
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
                ) : (
                  /* Scenario B & C: Check if optional meal is configured for this weekday */
                  (() => {
                    if (isLoadingPackage) {
                      return (
                        <div className="p-8 flex flex-col items-center justify-center gap-3 text-slate-500 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                          <span className="text-xs font-medium">Checking menu alternative dishes...</span>
                        </div>
                      );
                    }

                    const optMeal = getOptionalMealForDate(actionModalDate);

                    if (optMeal) {
                      return (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                Chef&apos;s Daily Alternative
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">Available</span>
                            </div>

                            {optMeal.image_url && (
                              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={optMeal.image_url}
                                  alt={optMeal.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div>
                              <h4 className="font-oswald text-lg font-bold uppercase text-neutral-900">
                                {optMeal.name}
                              </h4>
                              {optMeal.description && (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {optMeal.description}
                                </p>
                              )}
                            </div>

                            {/* Request Details Preview */}
                            <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80 text-purple-950 text-xs space-y-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                                <span className="font-oswald font-bold uppercase tracking-wide">
                                  Request Details to Submit:
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                <div>
                                  <span className="text-purple-700/80 font-medium block">Delivery Date:</span>
                                  <strong className="text-purple-950">
                                    {parseDateYMD(actionModalDate) ? formatDisplayDate(parseDateYMD(actionModalDate)!) : actionModalDate}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-purple-700/80 font-medium block">Selected Dish:</span>
                                  <strong className="text-purple-950 truncate block">{optMeal.name}</strong>
                                </div>
                              </div>
                              <p className="text-[11px] text-purple-800 border-t border-purple-200/60 pt-1.5 leading-relaxed">
                                Clicking &quot;Confirm Optional Meal Request&quot; will submit this alternative dish to your active subscription schedule.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setActionModalView("choose")}
                              disabled={isSubmittingOptional}
                              className="px-4 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:text-neutral-900 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                              Back
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRequestOptionalMeal(optMeal.id)}
                              disabled={isSubmittingOptional}
                              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] disabled:bg-emerald-300 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                            >
                              {isSubmittingOptional ? (
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
                      );
                    }

                    // Scenario C: No optional meal available on this date
                    return (
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
                              There is no alternative or optional meal configured for this weekday in your current meal plan. Your regular chef-crafted meal will be prepared and delivered as scheduled.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setActionModalView("choose")}
                            className="px-4 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:text-neutral-900 hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            Back to Options
                          </button>

                          <button
                            type="button"
                            onClick={() => setActionModalDate(null)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-oswald text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                          >
                            Keep Regular Meal
                          </button>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (!isInline) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/60 backdrop-blur-md animate-in fade-in duration-200 font-poppins">
        <div className="w-full max-w-4xl">{content}</div>
      </div>
    );
  }

  return content;
}

export const SubscriptionCalendarModal = SubscriptionCalendarView;

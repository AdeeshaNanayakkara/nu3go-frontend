"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import {
  subscriptionService,
  type SubscriptionResItem,
} from "@/services/api/subscription.service";
import { invoiceService, type InvoiceItem } from "@/services/api/invoice.service";
import { locationService, type LocationItem } from "@/services/api/location.service";
import { packageService, type PublicPackage } from "@/services/api/package.service";
import { ActivePlanCard } from "@/components/dashboard/active-plan-card";
import { NextMealCard } from "@/components/dashboard/next-meal-card";
import { KpiMetricCards } from "@/components/dashboard/kpi-metric-cards";
import { RecentInvoicesTable } from "@/components/dashboard/recent-invoices-table";
import { QuickActionsHub } from "@/components/dashboard/quick-actions-hub";
import {
  AlertTriangle,
  Compass,
  Calendar as CalendarIcon,
} from "lucide-react";
import { SubscriptionCalendarView } from "@/components/dashboard/subscription-calendar-modal";

export default function CustomerDashboardPage() {
  const { user } = useAuthStore();

  const [subscriptions, setSubscriptions] = useState<SubscriptionResItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal for cancelling subscription
  const [cancelModalSubId, setCancelModalSubId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Tab mode for active subscription view: plan summary card vs full delivery calendar
  const [viewTab, setViewTab] = useState<"card" | "calendar">("card");

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allSubs, locsData, pkgsData] = await Promise.all([
        subscriptionService.getSubscriptions(),
        locationService.getLocations().catch(() => []),
        packageService.getPublicPackages().catch(() => []),
      ]);

      // Only filter active subscriptions
      const activeSubs = (allSubs || []).filter(
        (s) => s.status?.toUpperCase() === "ACTIVE"
      );

      // Fetch invoices only for active subscriptions
      const activeInvoices = await invoiceService.getActiveSubscriptionsInvoices(activeSubs);

      setSubscriptions(activeSubs);
      setInvoices(activeInvoices);
      setLocations(locsData || []);
      setPackages(pkgsData || []);
    } catch (err) {
      console.error("[Dashboard] Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Primary active subscription
  const activeSubscription = subscriptions[selectedIndex] || subscriptions[0] || null;

  // Resolve package & plan details
  const getPackageName = (sub: SubscriptionResItem | null) => {
    if (!sub) return "Chef-Crafted Meal Plan";
    if (sub.package_name) return sub.package_name;
    if (sub.package?.name) return sub.package.name;
    if (sub.package_id) {
      const found = packages.find((p) => p.id === sub.package_id);
      if (found?.name) return found.name;
    }
    return "Chef-Crafted Meal Plan";
  };

  const getPlanLabel = (sub: SubscriptionResItem | null) => {
    if (!sub) return "Monthly (20 Weekdays)";
    if (sub.plan_name) return sub.plan_name;
    if (sub.plan?.name) return sub.plan.name;
    return "Monthly (20 Weekdays)";
  };

  // Default address
  const defaultAddress =
    locations.find((l) => l.is_default)?.address ||
    locations[0]?.address ||
    "Colombo 03 • Doorstep Delivery";

  const handleToggleAutoRenew = async (enabled: boolean) => {
    if (!activeSubscription) return;
    try {
      if (!enabled) {
        await subscriptionService.cancelAutoRenewal(activeSubscription.id);
      }
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to update auto-renew:", err);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalSubId) return;
    setIsCancelling(true);
    try {
      await subscriptionService.cancelSubscription(cancelModalSubId);
      setCancelModalSubId(null);
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const displayName = user?.name
    ? user.name
    : user?.email
      ? user.email.split("@")[0]
      : "Customer";

  // Calculate stats
  const totalInvoicesCount = invoices.length;
  const isPlanActive = activeSubscription && activeSubscription.status?.toUpperCase() === "ACTIVE";

  // Calculate delivery stats dynamically from active subscription dates
  const { totalPlanDays, daysDeliveredCount, remainingDaysCount } = (() => {
    if (!isPlanActive || !activeSubscription) {
      return { totalPlanDays: 20, daysDeliveredCount: 0, remainingDaysCount: 0 };
    }

    const startStr = activeSubscription.started_at || activeSubscription.created_at;
    const dueStr = activeSubscription.valid_until || activeSubscription.next_billing_date;

    if (!startStr || !dueStr) {
      return { totalPlanDays: 20, daysDeliveredCount: 14, remainingDaysCount: 6 };
    }

    const s = new Date(startStr.split("T")[0]);
    const d = new Date(dueStr.split("T")[0]);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (isNaN(s.getTime()) || isNaN(d.getTime()) || d <= s) {
      return { totalPlanDays: 20, daysDeliveredCount: 14, remainingDaysCount: 6 };
    }

    let total = 0;
    let delivered = 0;
    const cur = new Date(s);
    while (cur <= d) {
      const dow = cur.getDay();
      if (dow >= 1 && dow <= 5) {
        total++;
        if (cur < today) delivered++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    return {
      totalPlanDays: Math.max(1, total),
      daysDeliveredCount: delivered,
      remainingDaysCount: Math.max(0, total - delivered),
    };
  })();

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-poppins">
      {/* ─── 1. Welcome Greeting Banner ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-oswald text-xs font-bold uppercase tracking-wider text-[#15803D] bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#36D068] animate-ping" />
              {isPlanActive ? "Daily Fuel Active" : "Customer Dashboard"}
            </span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase text-neutral-900 tracking-tight leading-tight">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Here is your daily meal schedule, subscription progress, and recent deliveries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-neutral-800 font-oswald font-bold text-xs uppercase tracking-wider border border-slate-200 shadow-2xs transition-all active:scale-95"
          >
            <Compass className="w-4 h-4 text-[#36D068]" />
            <span>Browse Plans</span>
          </Link>
        </div>
      </div>

      {/* ─── 2. Active Subscription Card & Delivery Calendar Spotlight ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {subscriptions.length > 1 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-500 shrink-0">
                Active Subscriptions ({subscriptions.length}):
              </span>
              {subscriptions.map((sub, idx) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                    selectedIndex === idx
                      ? "bg-[#36D068] text-black shadow-md shadow-[#36D068]/20"
                      : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs"
                  }`}
                >
                  {getPackageName(sub)}
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* View Mode Toggle (Summary vs Calendar) */}
          {isPlanActive && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => setViewTab("card")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-oswald text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  viewTab === "card"
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-slate-600 hover:text-neutral-900"
                }`}
              >
                <span>Plan Summary</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab("calendar")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-oswald text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  viewTab === "calendar"
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-slate-600 hover:text-neutral-900"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Delivery Calendar</span>
              </button>
            </div>
          )}
        </div>

        {/* Inline View: Calendar OR Plan Card */}
        {viewTab === "calendar" && isPlanActive ? (
          <SubscriptionCalendarView
            subscription={activeSubscription}
            packageName={getPackageName(activeSubscription)}
            planDurationLabel={getPlanLabel(activeSubscription)}
            deliveryAddress={defaultAddress}
            onBackToOverview={() => setViewTab("card")}
          />
        ) : (
          <ActivePlanCard
            subscription={activeSubscription}
            packageName={getPackageName(activeSubscription)}
            planDurationLabel={getPlanLabel(activeSubscription)}
            totalDays={totalPlanDays}
            daysDelivered={daysDeliveredCount}
            deliveryAddress={defaultAddress}
            onToggleAutoRenew={handleToggleAutoRenew}
            onCancelPlan={
              activeSubscription ? () => setCancelModalSubId(activeSubscription.id) : undefined
            }
            onOpenCalendar={() => setViewTab("calendar")}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* ─── 3. Key Performance Metric Cards ─── */}
      <KpiMetricCards
        totalMealsDelivered={daysDeliveredCount}
        remainingDays={remainingDaysCount}
        dailyProteinAvg={42}
        totalInvoicesCount={totalInvoicesCount}
      />

      {/* ─── 4. Two-Column Showcase (Tomorrow's Meal + Recent Invoices) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Tomorrow's Dish Preview */}
        <div className="lg:col-span-6 flex flex-col">
          <NextMealCard
            deliveryAddress={defaultAddress}
            deliveryTime="Tomorrow • 7:00 AM – 8:30 AM"
          />
        </div>

        {/* Right Column: Recent Invoices & Receipts */}
        <div className="lg:col-span-6 flex flex-col">
          <RecentInvoicesTable invoices={invoices} isLoading={isLoading} />
        </div>
      </div>

      {/* ─── 5. Quick Actions Hub ─── */}
      <QuickActionsHub />

      {/* Cancel Plan Confirmation Modal */}
      {cancelModalSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-poppins">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-oswald font-bold uppercase text-neutral-900">Cancel Meal Subscription?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to cancel this plan? Your weekday morning meal deliveries will stop after the current active cycle.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancelModalSubId(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                Keep Plan
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-oswald text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

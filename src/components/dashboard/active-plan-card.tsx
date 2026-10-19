"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Compass,
} from "lucide-react";
import { SubscriptionResItem } from "@/services/api/subscription.service";

interface ActivePlanCardProps {
  subscription: SubscriptionResItem | null;
  packageName?: string;
  planDurationLabel?: string;
  totalDays?: number;
  daysDelivered?: number;
  deliveryAddress?: string;
  onToggleAutoRenew?: (enabled: boolean) => Promise<void>;
  onCancelPlan?: () => void;
  onOpenCalendar?: () => void;
  isLoading?: boolean;
}

export function ActivePlanCard({
  subscription,
  packageName = "Nu3 Power Athletic",
  planDurationLabel = "Monthly (20 Weekdays)",
  totalDays = 20,
  daysDelivered = 12,
  deliveryAddress,
  onToggleAutoRenew,
  onCancelPlan,
  onOpenCalendar,
  isLoading = false,
}: ActivePlanCardProps) {
  const [isTogglingRenew, setIsTogglingRenew] = useState(false);

  // If loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 animate-pulse space-y-6 shadow-sm font-poppins">
        <div className="flex justify-between items-center">
          <div className="h-6 w-40 bg-slate-200 rounded-xl" />
          <div className="h-6 w-24 bg-slate-200 rounded-full" />
        </div>
        <div className="h-20 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  // If NO active subscription exists
  if (!subscription || subscription.status === "CANCELLED" || subscription.status === "EXPIRED") {
    return (
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 relative overflow-hidden shadow-md group font-poppins">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#36D068]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#36D068]/20 transition-all duration-500" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] font-oswald text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#36D068]" />
              <span>Ready for Clean Nutrition</span>
            </div>
            <h2 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-neutral-900 tracking-tight leading-tight">
              No Active Subscription Found
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Fuel your lifestyle with chef-crafted, calorie-counted breakfasts delivered fresh to your doorstep every weekday morning.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/plans"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#36D068] hover:bg-[#2eb85c] text-black font-oswald font-bold text-sm uppercase tracking-wider rounded-2xl shadow-md shadow-[#36D068]/25 transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Plans & Subscribe</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(
    100,
    Math.round((daysDelivered / Math.max(1, totalDays)) * 100)
  );

  const handleAutoRenewToggle = async () => {
    if (!onToggleAutoRenew) return;
    setIsTogglingRenew(true);
    try {
      await onToggleAutoRenew(!subscription.auto_renew);
    } finally {
      setIsTogglingRenew(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (onOpenCalendar) onOpenCalendar();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (onOpenCalendar) onOpenCalendar();
          }
        }}
        aria-label="View subscription delivery calendar and dates"
        className="rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-400 p-6 sm:p-8 relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 font-poppins group cursor-pointer"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/5 group-hover:bg-[#36D068]/10 rounded-full blur-3xl pointer-events-none transition-all duration-500" />

        {/* Header Info */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-oswald text-xs font-bold uppercase tracking-wider text-[#15803D] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                Active Meal Plan
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {subscription.id.slice(0, 8)}...
              </span>
            </div>
            <h2 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-neutral-900 tracking-tight leading-tight group-hover:text-[#15803D] transition-colors">
              {packageName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {planDurationLabel} • Weekdays Morning Delivery
            </p>
          </div>

          {/* Status Badge & Calendar Quick Action */}
          <div className="flex items-center gap-2.5 self-start sm:self-center flex-wrap">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenCalendar) onOpenCalendar();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/90 text-[#15803D] border border-emerald-200 text-xs font-oswald font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-[#15803D]" />
              <span>View Calendar</span>
            </button>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] font-oswald text-xs font-bold uppercase tracking-wider shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#36D068] animate-pulse" />
              <span>{subscription.status}</span>
            </div>
          </div>
        </div>

        {/* Delivery Progress Bar (Clickable to open calendar) */}
        <div className="relative z-10 py-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-oswald font-bold uppercase tracking-wide text-neutral-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#36D068]" />
              Delivery Cycle Progress
            </span>
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <span>
                {daysDelivered} of {totalDays} Meals Delivered ({progressPercent}%)
              </span>
              <span className="text-[11px] text-[#15803D] font-oswald font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 hidden sm:inline">
                Click to view dates
              </span>
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#36D068] rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Started: {formatDate(subscription.started_at || subscription.created_at)}</span>
            <span>Valid until (Due): {formatDate(subscription.valid_until || subscription.next_billing_date)}</span>
          </div>
        </div>

        {/* Subscription Metrics Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 pb-6">
          {/* Next Billing / Due Date */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 group-hover:bg-slate-100/70 transition-colors">
            <div className="p-2 rounded-xl bg-emerald-100/70 text-[#15803D]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Due / Next Renewal</span>
              <span className="text-xs font-oswald font-bold uppercase tracking-wide text-neutral-900">
                {formatDate(subscription.next_billing_date || subscription.valid_until)}
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 group-hover:bg-slate-100/70 transition-colors">
            <div className="p-2 rounded-xl bg-blue-100/70 text-blue-700">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-medium text-slate-500 block">Delivery To</span>
              <span className="text-xs font-semibold text-neutral-900 truncate block">
                {deliveryAddress || "Primary Address"}
              </span>
            </div>
          </div>

          {/* Auto-Renewal Setting */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between group-hover:bg-slate-100/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100/70 text-[#15803D]">
                <RefreshCw className={`w-4 h-4 ${isTogglingRenew ? "animate-spin" : ""}`} />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Auto-Renew</span>
                <span className="text-xs font-oswald font-bold uppercase tracking-wide text-neutral-900">
                  {subscription.auto_renew ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isTogglingRenew}
              onClick={(e) => {
                e.stopPropagation();
                handleAutoRenewToggle();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                subscription.auto_renew
                  ? "bg-emerald-100/80 text-[#15803D] border-emerald-300 hover:bg-emerald-200/80"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-neutral-900"
              }`}
            >
              {subscription.auto_renew ? "Turn Off" : "Turn On"}
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenCalendar) onOpenCalendar();
            }}
            className="inline-flex items-center gap-2 text-xs font-oswald font-bold uppercase tracking-wider text-[#15803D] hover:text-[#36D068] transition-colors cursor-pointer group/link"
          >
            <Calendar className="w-4 h-4 text-[#36D068] group-hover/link:scale-110 transition-transform" />
            <span>View All Plan Dates in Calendar (Start to Due)</span>
            <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              onClick={(e) => e.stopPropagation()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-oswald font-bold uppercase tracking-wider text-slate-700 hover:text-neutral-900 transition-all cursor-pointer"
            >
              Change Address
            </Link>
            {onCancelPlan && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelPlan();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
              >
                Cancel Plan
              </button>
            )}
          </div>
        </div>
    </div>
    </>
  );
}

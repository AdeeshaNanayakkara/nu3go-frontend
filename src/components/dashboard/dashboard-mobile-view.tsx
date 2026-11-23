"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Compass,
  CreditCard,
  MapPin,
  MessageSquare,
  RefreshCw,
  Settings2,
  Sparkles,
  Utensils,
  Wallet,
  XCircle,
} from "lucide-react";
import type { SubscriptionResItem } from "@/services/api/subscription.service";
import { BottomSheet, Group, ListRow } from "@/components/mobile/mobile-ui";

export interface MobileSubscriptionTab {
  id: string;
  packageName: string;
  planName: string;
  isCustom: boolean;
}

interface DashboardMobileViewProps {
  displayName: string;
  isLoading: boolean;
  isPlanActive: boolean;
  /** null when the profile is complete (or not loaded) */
  profileIncompletePercent: number | null;
  tabs: MobileSubscriptionTab[];
  selectedIndex: number;
  onSelectTab: (index: number) => void;
  subscription: SubscriptionResItem | null;
  packageName: string;
  planName: string;
  isCustom: boolean;
  totalDays: number;
  daysDelivered: number;
  remainingDays: number;
  deliveryAddress: string;
  walletBalance: number;
  invoicesCount: number;
  onToggleAutoRenew: (enabled: boolean) => Promise<void>;
  onConfirmCancel: () => Promise<void>;
  onOpenCalendar: () => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatMoney = (value: number) => {
  const val = Number(value ?? 0);
  if (isNaN(val)) return "LKR 0";
  return val % 1 === 0
    ? `LKR ${val.toLocaleString("en-US")}`
    : `LKR ${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const RING_R = 34;
const RING_C = 2 * Math.PI * RING_R;

export function DashboardMobileView({
  displayName,
  isLoading,
  isPlanActive,
  profileIncompletePercent,
  tabs,
  selectedIndex,
  onSelectTab,
  subscription,
  packageName,
  planName,
  isCustom,
  totalDays,
  daysDelivered,
  remainingDays,
  deliveryAddress,
  walletBalance,
  invoicesCount,
  onToggleAutoRenew,
  onConfirmCancel,
  onOpenCalendar,
}: DashboardMobileViewProps) {
  const [showManage, setShowManage] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  }, []);

  const firstName = displayName.split(" ")[0] || "there";
  const progress = Math.min(100, Math.round((daysDelivered / Math.max(1, totalDays)) * 100));
  const hasPlan = !!subscription && isPlanActive;
  const autoRenew = !!subscription?.auto_renew;

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleAutoRenew(!autoRenew);
    } finally {
      setIsToggling(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onConfirmCancel();
      setShowCancel(false);
      setShowManage(false);
    } catch {
      // The failure toast is shown by apiClient; keep the sheet open so the user can retry
    } finally {
      setIsCancelling(false);
    }
  };

  const stats = [
    { label: "Delivered", value: `${daysDelivered}`, sub: "meals", icon: Utensils, tone: "bg-emerald-50 text-[#15803D]" },
    { label: "Remaining", value: `${remainingDays}`, sub: "weekdays", icon: CalendarCheck, tone: "bg-blue-50 text-blue-700" },
    { label: "Wallet", value: formatMoney(walletBalance), sub: "store credit", icon: Wallet, tone: "bg-amber-50 text-amber-700" },
    { label: "Invoices", value: `${invoicesCount}`, sub: "settled", icon: CreditCard, tone: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div className="font-poppins space-y-5 pb-6 animate-in fade-in duration-300">
      {/* Greeting */}
      <header className="flex items-center justify-between gap-3 px-1 pt-1">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{greeting}</p>
          <h1 className="truncate font-oswald text-2xl font-black uppercase tracking-tight text-neutral-900">
            {firstName} 👋
          </h1>
        </div>
        <Link
          href="/profile"
          aria-label="Open profile"
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-gradient-to-tr from-[#36D068] to-emerald-300 font-oswald text-lg font-black text-slate-950 shadow-md ring-2 ring-white active:scale-95"
        >
          {firstName.charAt(0).toUpperCase()}
        </Link>
      </header>

      {/* Profile completion nudge */}
      {profileIncompletePercent !== null && (
        <Link
          href="/profile"
          className="flex touch-manipulation items-center gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-3.5 active:bg-amber-100"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700">
            <AlertCircle className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-amber-900">Finish your profile</span>
            <span className="block text-xs text-amber-800/80">
              {profileIncompletePercent}% complete — add phone &amp; address to start deliveries
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-amber-600" />
        </Link>
      )}

      {/* Subscription switcher */}
      {tabs.length > 1 && (
        <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(idx)}
              className={`h-10 shrink-0 snap-start touch-manipulation rounded-full px-4 font-oswald text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedIndex === idx
                  ? "bg-[#0B3B17] text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-700 active:bg-slate-100"
              }`}
            >
              {tab.packageName}
              <span className="ml-1 font-normal opacity-70">· {tab.isCustom ? "Custom" : "Fixed"}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active plan hero */}
      {isLoading ? (
        <div className="h-72 animate-pulse rounded-[28px] bg-slate-200/70" aria-busy="true" />
      ) : hasPlan && subscription ? (
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B3B17] via-[#0E491D] to-[#07240E] p-5 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#36D068]/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 font-oswald text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#36D068]" />
                  {subscription.status}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 font-oswald text-[10px] font-bold uppercase tracking-wider ${
                    isCustom ? "bg-amber-400/25 text-amber-200" : "bg-sky-400/25 text-sky-200"
                  }`}
                >
                  {isCustom ? "Custom" : "Fixed"}
                </span>
              </div>
              <h2 className="truncate font-oswald text-2xl font-black uppercase leading-tight tracking-tight">
                {packageName}
              </h2>
              <p className="truncate text-xs text-emerald-100/80">{planName} · Weekday mornings</p>
            </div>

            <button
              type="button"
              onClick={() => setShowManage(true)}
              aria-label="Manage plan"
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/15 text-white active:bg-white/25"
            >
              <Settings2 className="h-5 w-5" />
            </button>
          </div>

          {/* Progress ring + numbers */}
          <div className="relative mt-5 flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={RING_R} stroke="rgba(255,255,255,0.15)" strokeWidth="7" fill="none" />
                <circle
                  cx="40"
                  cy="40"
                  r={RING_R}
                  stroke="#36D068"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C - (RING_C * progress) / 100}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-oswald text-2xl font-black leading-none">{progress}%</span>
                <span className="font-oswald text-[9px] font-bold uppercase tracking-wider text-white/60">done</span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2.5">
              <div>
                <p className="font-oswald text-[10px] font-bold uppercase tracking-wider text-white/60">Meals delivered</p>
                <p className="font-oswald text-xl font-bold leading-tight">
                  {daysDelivered} <span className="text-sm font-medium text-white/60">of {totalDays}</span>
                </p>
              </div>
              <div className="flex gap-4 text-xs">
                <div>
                  <p className="text-white/60">Started</p>
                  <p className="font-semibold">{formatDate(subscription.started_at || subscription.created_at)}</p>
                </div>
                <div>
                  <p className="text-white/60">Renews</p>
                  <p className="font-semibold">
                    {formatDate(subscription.next_billing_date || subscription.valid_until)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2.5 text-xs">
            <MapPin className="h-4 w-4 shrink-0 text-[#36D068]" />
            <span className="truncate font-medium">{deliveryAddress}</span>
          </div>

          <button
            type="button"
            onClick={onOpenCalendar}
            className="relative mt-4 flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-[#36D068] font-oswald text-sm font-bold uppercase tracking-wider text-slate-950 shadow-md transition-transform active:scale-[0.98]"
          >
            <Calendar className="h-4 w-4" />
            Meal requests &amp; calendar
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 text-center shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#36D068]/10 blur-3xl" />
          <div className="relative space-y-3">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#36D068]">
              <Sparkles className="h-7 w-7" />
            </span>
            <h2 className="font-oswald text-xl font-black uppercase tracking-tight text-neutral-900">
              No active subscription
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Chef-crafted, calorie-counted breakfasts delivered to your door every weekday morning.
            </p>
            <Link
              href="/plans"
              className="flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-[#36D068] font-oswald text-sm font-bold uppercase tracking-wider text-slate-950 shadow-md active:scale-[0.98]"
            >
              <Compass className="h-4 w-4" />
              Explore plans
            </Link>
          </div>
        </section>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-oswald text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {s.label}
                </span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${s.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              {isLoading ? (
                <div className="h-7 w-16 animate-pulse rounded-lg bg-slate-100" />
              ) : (
                <p className="truncate font-oswald text-2xl font-black leading-tight text-neutral-900">{s.value}</p>
              )}
              <p className="text-[11px] text-slate-500">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <Group title="Quick actions">
        <ListRow icon={Compass} label="Plans" value="Explore nutrition plans" href="/plans" />
        <ListRow icon={MapPin} label="Addresses" value="Delivery locations" href="/settings" />
        <ListRow icon={CreditCard} label="Finance" value="Payments & billing" href="/payments" />
        <ListRow icon={MessageSquare} label="Help" value="Nutrition support" href="/contact" />
      </Group>

      {/* Manage plan sheet */}
      <BottomSheet open={showManage} title="Manage plan" onClose={() => setShowManage(false)}>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200/80">
          <div className="flex min-h-[64px] items-center gap-3 px-4 py-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#15803D]">
              <RefreshCw className={`h-[18px] w-[18px] ${isToggling ? "animate-spin" : ""}`} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-neutral-900">Auto-renew</span>
              <span className="block text-xs text-slate-500">{autoRenew ? "Enabled" : "Disabled"}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={autoRenew}
              disabled={isToggling}
              onClick={handleToggle}
              className={`relative h-8 w-14 shrink-0 touch-manipulation rounded-full transition-colors disabled:opacity-60 ${
                autoRenew ? "bg-[#36D068]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                  autoRenew ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
          <ListRow icon={MapPin} label="Delivery" value="Change address" href="/settings" />
          <button
            type="button"
            onClick={() => {
              setShowManage(false);
              setShowCancel(true);
            }}
            className="flex min-h-[64px] w-full touch-manipulation items-center gap-3 px-4 py-2 text-left active:bg-rose-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[15px] font-semibold text-rose-600">Cancel plan</span>
          </button>
        </div>
      </BottomSheet>

      {/* Cancel confirmation sheet */}
      <BottomSheet open={showCancel} title="Cancel subscription?" onClose={() => !isCancelling && setShowCancel(false)}>
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-rose-50 p-3.5 text-rose-700">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm leading-relaxed">
            Your weekday morning deliveries will stop after the current active cycle.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => setShowCancel(false)}
            className="h-12 flex-1 touch-manipulation rounded-2xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 active:bg-slate-200"
          >
            Keep plan
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={handleCancel}
            className="h-12 flex-1 touch-manipulation rounded-2xl bg-rose-600 font-oswald text-sm font-bold uppercase tracking-wider text-white active:bg-rose-700 disabled:opacity-60"
          >
            {isCancelling ? "Cancelling…" : "Confirm cancel"}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

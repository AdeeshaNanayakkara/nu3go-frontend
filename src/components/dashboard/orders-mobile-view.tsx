"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Compass,
  Plus,
  Receipt,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";
import type { InvoiceItem } from "@/services/api/invoice.service";
import { BottomSheet } from "@/components/mobile/mobile-ui";

export interface OrderSubscriptionItem {
  id: string;
  packageName: string;
  isCustom: boolean;
  status: string;
  startedAt?: string;
  validUntil?: string;
  scheduledDays?: number;
  purchasedDays?: number;
  autoRenew: boolean;
  invoice: InvoiceItem | null;
}

interface OrdersMobileViewProps {
  items: OrderSubscriptionItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  onViewInvoice: (invoice: InvoiceItem) => void;
  onConfirmCancel: (id: string) => Promise<void>;
  /** Delivery calendar for the selected custom plan */
  children?: React.ReactNode;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export function OrdersMobileView({
  items,
  selectedId,
  onSelect,
  isLoading,
  onViewInvoice,
  onConfirmCancel,
  children,
}: OrdersMobileViewProps) {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const selected = items.find((i) => i.id === selectedId) || null;

  const handleCancel = async () => {
    if (!cancelId) return;
    setIsCancelling(true);
    try {
      await onConfirmCancel(cancelId);
      setCancelId(null);
    } catch {
      // The failure toast is shown by apiClient; keep the sheet open so the user can retry
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="font-poppins space-y-5 pb-6 animate-in fade-in duration-300">
      <header className="flex items-center justify-between gap-3 px-1 pt-1">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {isLoading ? "Loading…" : `${items.length} active ${items.length === 1 ? "plan" : "plans"}`}
          </p>
          <h1 className="truncate font-oswald text-2xl font-black uppercase tracking-tight text-neutral-900">
            My subscriptions
          </h1>
        </div>
        <Link
          href="/plans"
          aria-label="Subscribe to a new plan"
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-[#36D068] text-slate-950 shadow-md active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      {isLoading ? (
        <div className="space-y-3 animate-pulse" aria-busy="true">
          <div className="h-44 rounded-[28px] bg-slate-200/70" />
          <div className="h-44 rounded-[28px] bg-slate-200/50" />
        </div>
      ) : items.length === 0 ? (
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#15803D]">
            <UtensilsCrossed className="h-7 w-7" />
          </span>
          <h2 className="mt-3 font-oswald text-xl font-black uppercase tracking-tight text-neutral-900">
            No active subscriptions
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Choose from our athletic high-protein, classic, or school meal plans.
          </p>
          <Link
            href="/plans"
            className="mt-4 flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-[#36D068] font-oswald text-sm font-bold uppercase tracking-wider text-slate-950 shadow-md active:scale-[0.98]"
          >
            <Compass className="h-4 w-4" />
            Explore plans
          </Link>
        </section>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            const scheduled = item.scheduledDays ?? 0;
            const purchased = item.purchasedDays ?? 0;
            const pct = purchased > 0 ? Math.min(100, Math.round((scheduled / purchased) * 100)) : 0;
            return (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(item.id);
                  }
                }}
                className={`touch-manipulation rounded-[28px] border bg-white p-4 shadow-xs transition-all active:scale-[0.99] ${
                  isSelected ? "border-[#36D068] ring-2 ring-[#36D068]/25" : "border-slate-200/80"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-oswald text-lg font-bold uppercase leading-tight tracking-tight text-neutral-900">
                      {item.packageName}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-oswald text-[10px] font-extrabold uppercase tracking-wider ${
                          item.isCustom ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {item.isCustom ? "Custom" : "Fixed"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-oswald text-[10px] font-extrabold uppercase tracking-wider text-[#15803D]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#36D068]" />
                        {item.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>
                  {isSelected && item.isCustom && (
                    <span className="shrink-0 rounded-full bg-[#36D068]/15 px-2.5 py-1 font-oswald text-[10px] font-bold uppercase tracking-wider text-[#15803D]">
                      Calendar below
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-xs">
                  <div>
                    <p className="text-slate-500">Started</p>
                    <p className="font-semibold text-neutral-900">{formatDate(item.startedAt)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Valid until</p>
                    <p className="font-semibold text-neutral-900">{formatDate(item.validUntil)}</p>
                  </div>
                </div>

                {item.isCustom && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-semibold text-neutral-900">
                        <Calendar className="h-3.5 w-3.5 text-[#15803D]" />
                        {scheduled} scheduled
                      </span>
                      <span className="text-slate-500">{purchased} purchased</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#36D068] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                    <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                    Auto-renew <strong className="text-neutral-900">{item.autoRenew ? "On" : "Off"}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.invoice && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewInvoice(item.invoice as InvoiceItem);
                        }}
                        className="inline-flex h-10 touch-manipulation items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 font-oswald text-[11px] font-bold uppercase tracking-wider text-[#15803D] active:bg-emerald-100"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        Invoice
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCancelId(item.id);
                      }}
                      className="h-10 touch-manipulation rounded-full px-3.5 font-oswald text-[11px] font-bold uppercase tracking-wider text-rose-600 active:bg-rose-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {children && selected && (
            <div className="space-y-2 pt-2">
              <h3 className="flex items-center gap-1.5 px-2 font-oswald text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Delivery calendar
                <ChevronRight className="h-3 w-3" />
                <span className="truncate text-slate-700">{selected.packageName}</span>
              </h3>
              {children}
            </div>
          )}
        </div>
      )}

      <BottomSheet open={!!cancelId} title="Cancel meal plan?" onClose={() => !isCancelling && setCancelId(null)}>
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-rose-50 p-3.5 text-rose-700">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm leading-relaxed">
            Your weekday morning deliveries will stop at the end of the current billing cycle.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => setCancelId(null)}
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

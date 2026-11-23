"use client";

import { AlertCircle, CheckCircle2, ChevronRight, Receipt, ShieldCheck } from "lucide-react";
import type { InvoiceItem } from "@/services/api/invoice.service";

interface PaymentsMobileViewProps {
  invoices: InvoiceItem[];
  totalSpent: number;
  totalInvoices: number;
  hasActiveSubscriptions: boolean;
  isLoading: boolean;
  statusFilter: string;
  onFilterChange: (status: string) => void;
  onViewInvoice: (invoice: InvoiceItem) => void;
}

const FILTERS = ["ALL", "PAID", "PENDING"];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export function PaymentsMobileView({
  invoices,
  totalSpent,
  totalInvoices,
  hasActiveSubscriptions,
  isLoading,
  statusFilter,
  onFilterChange,
  onViewInvoice,
}: PaymentsMobileViewProps) {
  return (
    <div className="font-poppins space-y-5 pb-6 animate-in fade-in duration-300">
      <header className="px-1 pt-1">
        <p className="text-xs font-medium text-slate-500">Receipts &amp; statements</p>
        <h1 className="font-oswald text-2xl font-black uppercase tracking-tight text-neutral-900">
          Billing &amp; invoices
        </h1>
      </header>

      {/* Summary hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B3B17] via-[#0E491D] to-[#07240E] p-5 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#36D068]/20 blur-3xl" />
        <p className="relative font-oswald text-[10px] font-bold uppercase tracking-wider text-white/60">
          Total settled
        </p>
        {isLoading ? (
          <div className="relative mt-1 h-10 w-44 animate-pulse rounded-xl bg-white/15" />
        ) : (
          <p className="relative font-oswald text-4xl font-black leading-tight tracking-tight">
            <span className="mr-1.5 text-lg font-bold text-white/60">LKR</span>
            {totalSpent.toLocaleString()}
          </p>
        )}
        <div className="relative mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold">
            <Receipt className="h-3.5 w-3.5 text-[#36D068]" />
            {totalInvoices} {totalInvoices === 1 ? "invoice" : "invoices"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-[#36D068]" />
            PayHere · 256-bit encrypted
          </span>
        </div>
      </section>

      {/* Filter segmented control */}
      <div role="tablist" aria-label="Invoice status" className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/70 p-1">
        {FILTERS.map((st) => (
          <button
            key={st}
            type="button"
            role="tab"
            aria-selected={statusFilter === st}
            onClick={() => onFilterChange(st)}
            className={`h-11 touch-manipulation rounded-xl font-oswald text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === st ? "bg-white text-neutral-900 shadow-sm" : "text-slate-600 active:bg-white/50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      {isLoading ? (
        <div className="space-y-2 animate-pulse" aria-busy="true">
          <div className="h-[76px] rounded-3xl bg-slate-200/70" />
          <div className="h-[76px] rounded-3xl bg-slate-200/60" />
          <div className="h-[76px] rounded-3xl bg-slate-200/50" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="space-y-2 rounded-3xl border border-slate-200/80 bg-white px-5 py-10 text-center shadow-xs">
          <Receipt className="mx-auto h-8 w-8 text-slate-300" />
          <p className="text-sm leading-relaxed text-slate-500">
            {hasActiveSubscriptions
              ? "No invoices found for this filter."
              : "No active subscriptions yet. Invoices appear here once you subscribe to a meal plan."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
          {invoices.map((inv) => {
            const isPaid = inv.status?.toUpperCase() === "PAID";
            const period = inv.billing_start
              ? `${formatDate(inv.billing_start)} – ${formatDate(inv.billing_end)}`
              : "Monthly";
            return (
              <li key={inv.id}>
                <button
                  type="button"
                  onClick={() => onViewInvoice(inv)}
                  className="flex min-h-[76px] w-full touch-manipulation items-center gap-3 px-4 py-3 text-left transition-colors active:bg-slate-50"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isPaid ? "bg-emerald-50 text-[#15803D]" : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {isPaid ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[13px] font-bold text-neutral-900">
                      {inv.invoice_number || `INV-${inv.id.slice(0, 8)}`}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {formatDate(inv.created_at || inv.paid_at)} · {period}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-oswald text-base font-black leading-tight text-neutral-900">
                      {inv.currency || "LKR"} {Number(inv.grand_total || 0).toLocaleString()}
                    </span>
                    <span
                      className={`font-oswald text-[10px] font-bold uppercase tracking-wider ${
                        isPaid ? "text-[#15803D]" : "text-amber-600"
                      }`}
                    >
                      {inv.status || "PAID"}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

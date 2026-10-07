"use client";

import { useEffect, useState, useCallback } from "react";
import { invoiceService, type InvoiceItem } from "@/services/api/invoice.service";
import {
  subscriptionService,
  type SubscriptionResItem,
} from "@/services/api/subscription.service";
import { InvoiceReceiptModal } from "@/components/dashboard/invoice-receipt-modal";
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShieldCheck,
} from "lucide-react";

export default function BillingPaymentsPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<SubscriptionResItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allSubs = await subscriptionService.getSubscriptions();

      // Only filter active subscriptions
      const activeSubs = (allSubs || []).filter(
        (s) => s.status?.toUpperCase() === "ACTIVE"
      );

      // Fetch invoices belonging to active subscriptions
      const activeInvoices = await invoiceService.getActiveSubscriptionsInvoices(activeSubs);

      setActiveSubscriptions(activeSubs);
      setInvoices(activeInvoices);
    } catch (err) {
      console.error("Failed to fetch billing data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === "ALL") return true;
    return inv.status?.toUpperCase() === statusFilter;
  });

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

  const totalSpent = invoices
    .filter((i) => i.status?.toUpperCase() === "PAID")
    .reduce((sum, i) => sum + (Number(i.grand_total) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase text-neutral-900 tracking-tight leading-tight">
            Billing & Payment History
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Download receipts, track recurring subscription payments, and invoice statements.
          </p>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-500">Total Settled</span>
          <p className="font-oswald text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            LKR {totalSpent.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#15803D] font-semibold">100% On-time automated payments</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-500">Total Invoices</span>
          <p className="font-oswald text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">{invoices.length}</p>
          <p className="text-[11px] text-slate-500">Active recurring cycles</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1">
          <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-500">Payment Gateway</span>
          <p className="font-oswald text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-5 h-5 text-[#36D068]" />
            PayHere Preapproval
          </p>
          <p className="text-[11px] text-[#15803D] font-semibold">Bank-grade 256-bit encryption</p>
        </div>
      </div>

      {/* Invoices Table Section */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#15803D]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-oswald text-base sm:text-lg font-bold uppercase text-neutral-900 tracking-tight">Invoices ({filteredInvoices.length})</h2>
              <p className="text-xs text-slate-500">Detailed tax invoices and payment breakdown</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            {["ALL", "PAID", "PENDING"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider transition-all ${
                  statusFilter === st
                    ? "bg-[#36D068] text-black shadow-md shadow-[#36D068]/20"
                    : "text-slate-600 hover:text-neutral-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-14 bg-slate-100 rounded-2xl" />
            <div className="h-14 bg-slate-100 rounded-2xl" />
            <div className="h-14 bg-slate-100 rounded-2xl" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-medium text-slate-500">
              {activeSubscriptions.length === 0
                ? "No active subscriptions found. Invoices will appear here once you have an active meal subscription."
                : "No invoices found for your active subscriptions under the selected filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-oswald uppercase tracking-wider font-semibold">
                  <th className="pb-3">Invoice Number</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Billing Period</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status?.toUpperCase() === "PAID";
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-neutral-900 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-[#36D068]" />
                        <span>{inv.invoice_number || `INV-${inv.id.slice(0, 8)}`}</span>
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {formatDate(inv.created_at || inv.paid_at)}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {inv.billing_start ? `${formatDate(inv.billing_start)} - ${formatDate(inv.billing_end)}` : "Monthly"}
                      </td>
                      <td className="py-3.5 font-oswald font-black text-neutral-900">
                        {inv.currency || "LKR"} {Number(inv.grand_total || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-oswald font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 ${
                            isPaid
                              ? "bg-emerald-50 text-[#15803D] border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {inv.status || "PAID"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-2 rounded-xl text-slate-600 hover:text-neutral-900 bg-slate-100 hover:bg-slate-200/70 transition-colors inline-flex items-center gap-1 font-oswald text-xs font-bold uppercase tracking-wider border border-slate-200 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}

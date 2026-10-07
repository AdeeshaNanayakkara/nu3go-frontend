"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Eye,
} from "lucide-react";
import { InvoiceItem } from "@/services/api/invoice.service";
import { InvoiceReceiptModal } from "./invoice-receipt-modal";

interface RecentInvoicesTableProps {
  invoices: InvoiceItem[];
  isLoading?: boolean;
}

export function RecentInvoicesTable({
  invoices,
  isLoading = false,
}: RecentInvoicesTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

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

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 animate-pulse shadow-sm h-full font-poppins">
        <div className="h-6 w-48 bg-slate-200 rounded-xl" />
        <div className="h-14 bg-slate-100 rounded-2xl" />
        <div className="h-14 bg-slate-100 rounded-2xl" />
        <div className="h-14 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-5 h-full flex flex-col justify-between font-poppins">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#15803D]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-oswald text-base sm:text-lg font-bold uppercase text-neutral-900 tracking-tight">
                Recent Invoices & Receipts
              </h3>
              <p className="text-xs text-slate-500">
                Payment history and recurring subscription invoices
              </p>
            </div>
          </div>

          <Link
            href="/payments"
            className="inline-flex items-center gap-1 font-oswald text-xs font-bold uppercase tracking-wider text-[#15803D] hover:text-[#36D068] transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Invoices List / Table */}
        {!invoices || invoices.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex-1 flex flex-col items-center justify-center">
            <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-medium text-slate-500">
              No recent invoices found for your active plans.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 flex-1">
            {invoices.slice(0, 4).map((invoice) => {
              const isPaid = invoice.status?.toUpperCase() === "PAID";
              return (
                <div
                  key={invoice.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isPaid ? "bg-emerald-100/70 text-[#15803D]" : "bg-amber-100/70 text-amber-700"
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-neutral-900 block group-hover:text-[#15803D] transition-colors">
                        {invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(invoice.created_at || invoice.paid_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-10 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <span className="font-oswald text-xs font-black text-neutral-900 block">
                        {invoice.currency || "LKR"}{" "}
                        {Number(invoice.grand_total || 0).toLocaleString()}
                      </span>
                      <span
                        className={`font-oswald text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                          isPaid
                            ? "text-[#15803D] bg-emerald-50 border border-emerald-200"
                            : "text-amber-700 bg-amber-50 border border-amber-200"
                        }`}
                      >
                        {invoice.status || "PAID"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(invoice)}
                      className="p-2 rounded-xl text-slate-500 hover:text-neutral-900 bg-white hover:bg-slate-200/60 border border-slate-200 transition-colors shadow-2xs"
                      title="View Invoice Receipt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </>
  );
}

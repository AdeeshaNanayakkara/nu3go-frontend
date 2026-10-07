"use client";

import { X, CheckCircle2, AlertCircle, Receipt, Download, Printer } from "lucide-react";
import { InvoiceItem } from "@/services/api/invoice.service";

interface InvoiceReceiptModalProps {
  invoice: InvoiceItem | null;
  onClose: () => void;
}

export function InvoiceReceiptModal({ invoice, onClose }: InvoiceReceiptModalProps) {
  if (!invoice) return null;

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

  const isPaid = invoice.status?.toUpperCase() === "PAID";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-poppins">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#15803D]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                {invoice.invoice_number || `INV-${invoice.id.slice(0, 6)}`}
              </h3>
              <p className="text-xs text-slate-500">
                Created on {formatDate(invoice.created_at)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pill & Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block font-medium">Payment Status</span>
            <span
              className={`font-oswald text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5 mt-0.5 ${
                isPaid ? "text-[#15803D]" : "text-amber-700"
              }`}
            >
              {isPaid ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {invoice.status || "PAID"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block font-medium">Total Amount</span>
            <span className="font-oswald text-xl font-black text-neutral-900 tracking-tight">
              {invoice.currency || "LKR"} {Number(invoice.grand_total || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dates Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px]">Billing Period</span>
            <span className="font-semibold text-neutral-900">
              {formatDate(invoice.billing_start)} - {formatDate(invoice.billing_end)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px]">Paid At</span>
            <span className="font-semibold text-neutral-900">
              {formatDate(invoice.paid_at || invoice.due_date)}
            </span>
          </div>
        </div>

        {/* Financial Line Item Breakdown */}
        <div className="space-y-2.5 pt-2 border-t border-slate-200 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal (Subscription Meal Plan)</span>
            <span className="font-semibold text-neutral-900">
              {invoice.currency || "LKR"} {Number(invoice.subtotal || invoice.grand_total || 0).toLocaleString()}
            </span>
          </div>

          {(invoice.discount_amount ?? 0) > 0 && (
            <div className="flex justify-between text-[#15803D]">
              <span>Discount Promo Applied</span>
              <span className="font-semibold">
                - {invoice.currency || "LKR"} {Number(invoice.discount_amount).toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Delivery & Packaging Fees</span>
            <span className="font-semibold text-[#15803D]">FREE (Included)</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Tax (VAT)</span>
            <span className="font-semibold text-neutral-900">
              {invoice.currency || "LKR"} {Number(invoice.tax_amount || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm font-bold text-neutral-900">
            <span className="font-oswald uppercase tracking-wide">Grand Total Paid</span>
            <span className="font-oswald text-lg font-black text-[#15803D]">
              {invoice.currency || "LKR"} {Number(invoice.grand_total || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-oswald font-bold text-xs uppercase tracking-wider border border-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#36D068] hover:bg-[#2eb85c] text-black font-oswald font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#36D068]/20"
          >
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}

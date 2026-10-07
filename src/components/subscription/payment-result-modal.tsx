"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  ReceiptText,
  Clock,
  RotateCcw,
  LayoutDashboard,
  UtensilsCrossed,
  PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PaymentResultModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const paymentStatus = searchParams.get("payment") || searchParams.get("status");
  const orderId = searchParams.get("order_id") || searchParams.get("id");
  const errorMessage = searchParams.get("message") || searchParams.get("error");

  // Determine if payment modal should be visible
  const isSuccess =
    paymentStatus === "success" ||
    paymentStatus === "approved" ||
    paymentStatus === "completed" ||
    paymentStatus === "1";

  const isFailedOrCancelled =
    paymentStatus === "cancelled" ||
    paymentStatus === "cancel" ||
    paymentStatus === "failed" ||
    paymentStatus === "error" ||
    paymentStatus === "-1" ||
    paymentStatus === "-2" ||
    (!!errorMessage && !isSuccess);

  const isOpen = Boolean(isSuccess || isFailedOrCancelled);

  if (!isOpen) return null;

  const handleClose = () => {
    // Clean up query params from URL without reload
    const params = new URLSearchParams(searchParams.toString());
    params.delete("payment");
    params.delete("status");
    params.delete("order_id");
    params.delete("id");
    params.delete("message");
    params.delete("error");

    const newQuery = params.toString();
    const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "fixed",
        "inset-0",
        "z-50",
        "bg-black/75",
        "backdrop-blur-sm",
        "flex",
        "items-center",
        "justify-center",
        "p-3",
        "sm:p-5",
        "select-none"
      )}
    >
      <div
        className={cn(
          "bg-white",
          "rounded-3xl",
          "border",
          "border-slate-200",
          "shadow-2xl",
          "max-w-lg",
          "w-full",
          "p-6",
          "sm:p-8",
          "space-y-4",
          "sm:space-y-5",
          "animate-in",
          "fade-in",
          "zoom-in-95",
          "duration-150",
          "relative",
          "font-poppins",
          "max-h-[94vh]",
          "overflow-y-auto"
        )}
      >
        {/* ─── Close X Button ─── */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* ══════════════════════════════════════════════════════════════
              PAYMENT SUCCESS POPUP MODAL (NU3GO LIGHT AESTHETIC)
             ══════════════════════════════════════════════════════════════ */
          <>
            {/* Top Icon & Eyebrow Badge */}
            <div className="text-center pt-2">
              <div className="w-16 h-16 sm:w-18 sm:h-18 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-3.5 shadow-sm text-[#28B454] animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10 text-[#28B454]" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-emerald-50 text-[#15803D] border border-emerald-200 mb-2 font-oswald">
                <Sparkles className="w-3 h-3 text-[#28B454] animate-pulse" />
                <span>SUBSCRIPTION ACTIVATED</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-oswald uppercase tracking-tight leading-tight">
                Payment Authorized!
              </h3>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2 max-w-sm mx-auto">
                Your payment card has been securely pre-approved with PayHere. Your fresh chef-crafted meal deliveries have been activated!
              </p>
            </div>

            {/* Order Reference & Gateway Card */}
            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
                <span className="font-semibold text-slate-500 flex items-center gap-1.5 font-oswald text-[11px] uppercase tracking-wider">
                  <ReceiptText className="w-3.5 h-3.5 text-[#28B454]" />
                  <span>Order Reference</span>
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {orderId || "SUB-" + Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Authorized On
                </span>
                <span className="font-medium text-slate-800">{currentDate}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#28B454]" /> Gateway Status
                </span>
                <span className="font-bold text-[#15803D] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#28B454] animate-ping" />
                  Preapproved (Active)
                </span>
              </div>
            </div>

            {/* Delivery Assistance Note */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-[#0B3B17]">
              <Sparkles className="w-4 h-4 text-[#28B454] shrink-0 mt-0.5" />
              <p className="leading-snug text-slate-700 text-[11.5px]">
                You can manage upcoming meals, switch delivery addresses, or pause dates anytime from your Customer Dashboard.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Link
                href="/dashboard"
                onClick={handleClose}
                className="flex-1 py-3.5 rounded-2xl bg-[#0B3B17] hover:bg-[#124D20] text-white text-xs sm:text-sm font-bold font-oswald uppercase tracking-wider transition-all shadow-md shadow-[#0B3B17]/25 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <LayoutDashboard className="w-4 h-4 text-[#36D068]" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#36D068]" />
              </Link>

              <Link
                href="/orders"
                onClick={handleClose}
                className="py-3.5 px-5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold font-oswald uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <UtensilsCrossed className="w-4 h-4 text-slate-500" />
                <span>My Subscriptions</span>
              </Link>
            </div>
          </>
        ) : (
          /* ══════════════════════════════════════════════════════════════
              PAYMENT CANCELLED / FAILED POPUP MODAL (NU3GO LIGHT AESTHETIC)
             ══════════════════════════════════════════════════════════════ */
          <>
            {/* Top Icon & Eyebrow Badge */}
            <div className="text-center pt-2">
              <div className="w-16 h-16 sm:w-18 sm:h-18 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-center mx-auto mb-3.5 shadow-sm text-amber-600 animate-in zoom-in-75 duration-300">
                <AlertTriangle className="w-9 h-9 sm:w-10 sm:h-10 text-amber-600" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 mb-2 font-oswald">
                <span>SUBSCRIPTION INCOMPLETE</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-oswald uppercase tracking-tight leading-tight">
                {paymentStatus === "failed" ? "Payment Failed" : "Authorization Cancelled"}
              </h3>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-2 max-w-sm mx-auto">
                {errorMessage ||
                  (paymentStatus === "failed"
                    ? "The bank or PayHere gateway could not authorize the card. No charges were made."
                    : "You closed the PayHere payment window or cancelled the authorization. No charges were made.")}
              </p>
            </div>

            {/* Info Breakdown Box */}
            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2.5 text-xs text-slate-700">
              {orderId && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <span className="font-semibold text-slate-500 flex items-center gap-1.5 font-oswald text-[11px] uppercase tracking-wider">
                    <ReceiptText className="w-3.5 h-3.5 text-slate-400" /> Reference
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800">{orderId}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-amber-700">Incomplete (No Charge)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Scheduled Meals</span>
                <span className="font-medium text-slate-700">Not activated</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3.5 rounded-2xl bg-[#0B3B17] hover:bg-[#124D20] text-white text-xs sm:text-sm font-bold font-oswald uppercase tracking-wider transition-all shadow-md shadow-[#0B3B17]/25 flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <RotateCcw className="w-4 h-4 text-[#36D068]" />
                <span>CHOOSE PLAN &amp; TRY AGAIN</span>
              </button>

              <Link
                href="/contact"
                onClick={handleClose}
                className="py-3.5 px-5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold font-oswald uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <PhoneCall className="w-4 h-4 text-slate-500" />
                <span>Support</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

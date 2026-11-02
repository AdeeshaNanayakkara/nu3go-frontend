"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  subscriptionService,
  type SubscriptionResItem,
} from "@/services/api/subscription.service";
import { invoiceService, type InvoiceItem } from "@/services/api/invoice.service";
import { packageService, type PublicPackage } from "@/services/api/package.service";
import { InvoiceReceiptModal } from "@/components/dashboard/invoice-receipt-modal";
import {
  UtensilsCrossed,
  Sparkles,
  Clock,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Compass,
  Receipt,
  Eye,
} from "lucide-react";

export default function SubscriptionsOrdersPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionResItem[]>([]);
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [subInvoicesMap, setSubInvoicesMap] = useState<Record<string, InvoiceItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<SubscriptionResItem | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allSubs, pkgsData] = await Promise.all([
        subscriptionService.getSubscriptions(),
        packageService.getPublicPackages().catch(() => []),
      ]);

      // Only show active subscriptions
      const activeSubs = (allSubs || []).filter(
        (s) => s.status?.toUpperCase() === "ACTIVE"
      );

      setSubscriptions(activeSubs);
      setPackages(pkgsData || []);
      if (activeSubs.length > 0) {
        setSelectedSub(activeSubs[0]);
      } else {
        setSelectedSub(null);
      }

      // Fetch active subscription invoices for each active subscription
      const invoicePromises = activeSubs.map(async (sub) => {
        const invs = await invoiceService.getSubscriptionInvoices(sub.id).catch(() => []);
        return { subId: sub.id, invs };
      });
      const results = await Promise.all(invoicePromises);
      const invMap: Record<string, InvoiceItem[]> = {};
      results.forEach((r) => {
        invMap[r.subId] = r.invs;
      });
      setSubInvoicesMap(invMap);
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleToggleRenew = async (subId: string, currentAutoRenew: boolean) => {
    try {
      if (currentAutoRenew) {
        await subscriptionService.cancelAutoRenewal(subId);
      }
      await fetchSubscriptions();
    } catch (err) {
      console.error("Failed to update auto renew:", err);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalId) return;
    setIsCancelling(true);
    try {
      await subscriptionService.cancelSubscription(cancelModalId);
      setCancelModalId(null);
      await fetchSubscriptions();
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
    } finally {
      setIsCancelling(false);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase text-neutral-900 tracking-tight leading-tight">
            Active Subscriptions & Meal Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Manage your active meal subscriptions, weekday delivery calendar, invoices, and auto-renew preferences.
          </p>
        </div>

        <Link
          href="/plans"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#36D068] hover:bg-[#2eb85c] text-black font-oswald font-bold text-xs uppercase tracking-wider shadow-md shadow-[#36D068]/20 transition-all active:scale-95 self-start sm:self-center"
        >
          <Compass className="w-4 h-4" />
          <span>Subscribe to New Plan</span>
        </Link>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="h-64 bg-slate-100 rounded-3xl" />
        </div>
      ) : subscriptions.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-md font-poppins">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#15803D]">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-oswald text-2xl font-bold uppercase text-neutral-900">No Active Subscriptions</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              You do not have any active meal plans right now. Choose from our athletic high-protein, classic, or school plans.
            </p>
          </div>
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#36D068] hover:bg-[#2eb85c] text-black font-oswald font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-[#36D068]/25 transition-all"
          >
            <span>Explore All Plans</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
            <h3 className="font-oswald text-sm font-bold uppercase tracking-wider text-neutral-900">
              Active Packages ({subscriptions.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                const isActive = sub.status?.toUpperCase() === "ACTIVE";
                const subInvoices = subInvoicesMap[sub.id] || [];
                const latestInvoice = subInvoices[0] || null;

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSub(sub)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden shadow-2xs ${isSelected
                        ? "bg-emerald-50/60 border-emerald-300 shadow-md shadow-emerald-500/5"
                        : "bg-white hover:bg-slate-50 border-slate-200/90"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="font-oswald text-sm font-bold uppercase text-neutral-900 truncate">
                        {getPackageName(sub)}
                      </span>
                      <span
                        className={`font-oswald text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${isActive
                            ? "bg-emerald-50 text-[#15803D] border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                      >
                        {sub.status || "ACTIVE"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p>Started: {formatDate(sub.started_at || sub.created_at)}</p>
                      <p>Valid Until: {formatDate(sub.valid_until)}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                      <span className="text-slate-600">
                        Auto-Renew:{" "}
                        <strong className="text-neutral-900">
                          {sub.auto_renew ? "On" : "Off"}
                        </strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {latestInvoice && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoice(latestInvoice);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-oswald font-bold uppercase tracking-wider text-[#15803D] hover:underline"
                            title="View Active Subscription Invoice Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelModalId(sub.id);
                          }}
                          className="font-oswald text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-poppins">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-oswald text-lg font-bold uppercase text-neutral-900">Cancel Meal Plan?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to cancel this plan? Your weekday morning deliveries will stop at the end of the current billing cycle.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancelModalId(null)}
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

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}

"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PieChart,
  Layers,
  TrendingUp,
  Tag,
  CreditCard,
  Grid,
  RefreshCw,
} from "lucide-react";
import { SalesOverviewSummary } from "@/components/admin/sales-overview-summary";
import { SalesRevenueView } from "@/components/admin/sales-revenue-view";
import { SalesBreakdownView } from "@/components/admin/sales-breakdown-view";
import { SalesDiscountsView } from "@/components/admin/sales-discounts-view";
import { SalesPaymentsView } from "@/components/admin/sales-payments-view";
import { SalesCohortsView } from "@/components/admin/sales-cohorts-view";

function SalesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewQuery = searchParams?.get("view");
  const activeView =
    viewQuery === "breakdown"
      ? "breakdown"
      : viewQuery === "revenue"
      ? "revenue"
      : viewQuery === "discounts"
      ? "discounts"
      : viewQuery === "payments"
      ? "payments"
      : viewQuery === "cohorts"
      ? "cohorts"
      : "overview";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-poppins">
      {/* ─── Header Banner ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Admin Portal • Financial Intelligence
            </span>
            <span className="text-slate-500 text-xs font-medium">
              {activeView === "overview"
                ? "Sales & Revenue Overview"
                : activeView === "revenue"
                ? "Revenue Timeline & Stream Composition"
                : activeView === "discounts"
                ? "Discounts & Coupon Performance"
                : activeView === "payments"
                ? "Payment Gateway & Billing Health"
                : activeView === "cohorts"
                ? "Revenue Retention Cohorts Matrix"
                : "Revenue Breakdown"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            {activeView === "overview" ? (
              <>
                <PieChart className="w-7 h-7 text-[#36D068]" />
                <span>Sales Analytics Overview</span>
              </>
            ) : activeView === "revenue" ? (
              <>
                <TrendingUp className="w-7 h-7 text-[#36D068]" />
                <span>Revenue Trend & Stream Composition</span>
              </>
            ) : activeView === "discounts" ? (
              <>
                <Tag className="w-7 h-7 text-[#36D068]" />
                <span>Discount & Promo Performance</span>
              </>
            ) : activeView === "payments" ? (
              <>
                <CreditCard className="w-7 h-7 text-[#36D068]" />
                <span>Payment Health & Telemetry</span>
              </>
            ) : activeView === "cohorts" ? (
              <>
                <Grid className="w-7 h-7 text-[#36D068]" />
                <span>Revenue Retention Cohorts</span>
              </>
            ) : (
              <>
                <Layers className="w-7 h-7 text-[#36D068]" />
                <span>Revenue Breakdown Analytics</span>
              </>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeView === "overview"
              ? "Key financial indicators: gross/net revenue, cash collected, MRR, ARPU, discounts, and customer billing health."
              : activeView === "revenue"
              ? "Time-series revenue accounting: gross vs net revenue, discounts, wallet redemptions, cash collected, and new vs renewal splits."
              : activeView === "discounts"
              ? "Every discount redeemed on paid invoices: redemptions, unique customers, discount totals, and net sales generated."
              : activeView === "payments"
              ? "First-checkout payment outcomes, recurring billing renewal success, top failure reasons, and at-risk subscription MRR."
              : activeView === "cohorts"
              ? "Customer cohorts grouped by month of first paid invoice: monthly retention %, active subscriber counts, and retained net revenue."
              : "Net revenue in the range split by package, subscription plan, billing cycle, or plan type."}
          </p>
        </div>
      </div>

      {/* ─── Sales Sub-Navigation Tabs ─── */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: PieChart },
          { id: "revenue", label: "Revenue", icon: TrendingUp },
          { id: "breakdown", label: "Breakdown", icon: Layers },
          { id: "discounts", label: "Discounts", icon: Tag },
          { id: "payments", label: "Payments", icon: CreditCard },
          { id: "cohorts", label: "Cohorts", icon: Grid },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isCurrent = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => router.push(`/admin/sales?view=${tab.id}`)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isCurrent
                  ? "bg-[#36D068] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isCurrent ? "text-white" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ─── */}
      {activeView === "breakdown" ? (
        <SalesBreakdownView />
      ) : activeView === "revenue" ? (
        <SalesRevenueView />
      ) : activeView === "discounts" ? (
        <SalesDiscountsView />
      ) : activeView === "payments" ? (
        <SalesPaymentsView />
      ) : activeView === "cohorts" ? (
        <SalesCohortsView />
      ) : (
        <SalesOverviewSummary />
      )}
    </div>
  );
}

export default function AdminSalesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-[#36D068]" />
        </div>
      }
    >
      <SalesPageContent />
    </Suspense>
  );
}

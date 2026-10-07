"use client";

import {
  Utensils,
  CalendarCheck,
  Zap,
  CreditCard,
  TrendingUp,
  Award,
} from "lucide-react";

interface KpiMetricCardsProps {
  totalMealsDelivered?: number;
  remainingDays?: number;
  dailyProteinAvg?: number;
  totalInvoicesCount?: number;
}

export function KpiMetricCards({
  totalMealsDelivered = 12,
  remainingDays = 8,
  dailyProteinAvg = 42,
  totalInvoicesCount = 3,
}: KpiMetricCardsProps) {
  const cards = [
    {
      title: "Meals Delivered",
      value: `${totalMealsDelivered}`,
      subtitle: "This billing period",
      icon: Utensils,
      bg: "bg-emerald-50",
      accent: "text-[#15803D]",
      border: "border-emerald-200",
    },
    {
      title: "Days Remaining",
      value: `${remainingDays}`,
      subtitle: "Scheduled weekday meals",
      icon: CalendarCheck,
      bg: "bg-blue-50",
      accent: "text-blue-700",
      border: "border-blue-200",
    },
    {
      title: "Avg. Protein Target",
      value: `${dailyProteinAvg}g`,
      subtitle: "Per athletic breakfast",
      icon: Zap,
      bg: "bg-amber-50",
      accent: "text-amber-700",
      border: "border-amber-200",
    },
    {
      title: "Settled Invoices",
      value: `${totalInvoicesCount}`,
      subtitle: "100% On-time payments",
      icon: CreditCard,
      bg: "bg-purple-50",
      accent: "text-purple-700",
      border: "border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 font-poppins">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden transition-all duration-300 hover:border-slate-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-oswald text-xs font-bold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-oswald text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight block">
                {card.value}
              </span>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import {
  Utensils,
  CalendarCheck,
  Wallet,
  CreditCard,
  TrendingUp,
  Award,
} from "lucide-react";
import { useMemo } from "react";

interface KpiMetricCardsProps {
  totalMealsDelivered?: number;
  remainingDays?: number;
  walletBalance?: number;
  dailyProteinAvg?: number; // legacy prop
  totalInvoicesCount?: number;
  isLoading?: boolean;
}

export function KpiMetricCards({
  totalMealsDelivered = 12,
  remainingDays = 8,
  walletBalance = 0,
  dailyProteinAvg,
  totalInvoicesCount = 3,
  isLoading = false,
}: KpiMetricCardsProps) {
  const formattedBalance = useMemo(() => {
    const val = Number(walletBalance ?? 0);
    if (isNaN(val)) return "LKR 0";
    return val % 1 === 0
      ? `LKR ${val.toLocaleString("en-US")}`
      : `LKR ${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [walletBalance]);

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
      title: "Wallet Balance",
      value: formattedBalance,
      subtitle: "Available store credit",
      icon: Wallet,
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

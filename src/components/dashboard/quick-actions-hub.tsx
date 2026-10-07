"use client";

import Link from "next/link";
import {
  Compass,
  MapPin,
  CreditCard,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";

export function QuickActionsHub() {
  const actions = [
    {
      title: "Explore Nutrition Plans",
      description: "Upgrade, change package, or explore school & athletic meal plans.",
      href: "/plans",
      icon: Compass,
      bg: "bg-emerald-50",
      color: "text-[#15803D]",
      badge: "Plans",
    },
    {
      title: "Delivery Locations",
      description: "Update your home, gym or office morning delivery addresses.",
      href: "/settings",
      icon: MapPin,
      bg: "bg-blue-50",
      color: "text-blue-700",
      badge: "Addresses",
    },
    {
      title: "Payment & Billing",
      description: "View receipts, download invoices, or update saved payment cards.",
      href: "/payments",
      icon: CreditCard,
      bg: "bg-purple-50",
      color: "text-purple-700",
      badge: "Finance",
    },
    {
      title: "Nutrition Support",
      description: "Have a dietary question? Chat with our team of nutritionist chefs.",
      href: "/contact",
      icon: MessageSquare,
      bg: "bg-amber-50",
      color: "text-amber-700",
      badge: "Help",
    },
  ];

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4 font-poppins">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-oswald text-base sm:text-lg font-bold uppercase text-neutral-900 tracking-tight">
            Quick Actions
          </h3>
          <p className="text-xs text-slate-500">
            Frequently used customer management shortcuts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              href={act.href}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 transition-all flex items-start gap-3.5 group relative overflow-hidden shadow-2xs"
            >
              <div className={`p-2.5 rounded-xl ${act.bg} ${act.color} shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-oswald text-xs font-bold uppercase tracking-wider text-neutral-900 group-hover:text-[#15803D] transition-colors truncate">
                    {act.title}
                  </h4>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {act.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  MapPin,
  ArrowRight,
  CreditCard,
  UtensilsCrossed,
  Percent,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Settings",
  robots: { index: false },
};

export default function AdminSettingsPage() {
  const settingsCards = [
    {
      id: "meals",
      title: "Meal Management",
      description: "Manage system meals catalog, recipes, dietary details, and meal items.",
      icon: UtensilsCrossed,
      href: "/admin/services",
      badge: "Configure",
      active: true,
      color: "bg-[#36D068]/15 text-[#36D068] border-[#36D068]/20",
    },
    {
      id: "faq",
      title: "FAQ Management",
      description: "Manage frequently asked questions, categories, and answer guides for users.",
      icon: HelpCircle,
      href: "/admin/settings/faqs",
      badge: "Configure",
      active: true,
      color: "bg-[#36D068]/15 text-[#36D068] border-[#36D068]/20",
    },
    {
      id: "zones",
      title: "Zone Management",
      description: "Manage delivery & service availability zones across different regions.",
      icon: MapPin,
      href: "/admin/settings/zones",
      badge: "Configure",
      active: true,
      color: "bg-[#36D068]/15 text-[#36D068] border-[#36D068]/20",
    },
    {
      id: "subscriptions",
      title: "Subscription Management",
      description: "Configure subscription plans, duration limits, and active plan offerings.",
      icon: CreditCard,
      href: "/admin/settings/subscription-plans",
      badge: "Configure",
      active: true,
      color: "bg-[#36D068]/15 text-[#36D068] border-[#36D068]/20",
    },
    {
      id: "discounts",
      title: "Discount Management",
      description: "Manage promotional discounts, percentage rates, validity periods, and package assignments.",
      icon: Percent,
      href: "/admin/settings/discounts",
      badge: "Configure",
      active: true,
      color: "bg-[#36D068]/15 text-[#36D068] border-[#36D068]/20",
    },
  ];

  return (
    <div className="space-y-8 font-poppins text-slate-900">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-slate-500 text-xs font-medium">System Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Settings & Control Panel
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Select a module below to configure platform settings, FAQs, and system policies.
          </p>
        </div>
      </div>

      {/* 4 Cards per row 1:1 Aspect Ratio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          const CardContent = (
            <div
              className={`bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between aspect-square transition-all shadow-sm h-full ${
                card.active
                  ? "hover:border-[#36D068] hover:shadow-md cursor-pointer group"
                  : "opacity-75"
              }`}
            >
              {/* Card Top: Icon & Badge */}
              <div className="flex items-start justify-between">
                <div className={`p-3.5 rounded-2xl border ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    card.active
                      ? "bg-[#36D068]/15 text-[#2ca752]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {card.badge}
                </span>
              </div>

              {/* Card Body: Title & Description */}
              <div className="my-auto space-y-2">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#36D068] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {card.description}
                </p>
              </div>

              {/* Card Footer: Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className={card.active ? "text-slate-700 group-hover:text-[#36D068]" : "text-slate-400"}>
                  {card.active ? "Manage Module" : "Locked"}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    card.active
                      ? "bg-slate-100 group-hover:bg-[#36D068] text-slate-600 group-hover:text-white"
                      : "bg-slate-50 text-slate-300"
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );

          return card.active ? (
            <Link key={card.id} href={card.href} className="block h-full">
              {CardContent}
            </Link>
          ) : (
            <div key={card.id} className="h-full">
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Bell,
  CheckCheck,
  Utensils,
  Receipt,
  Sparkles,
  Info,
  Clock,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: "delivery" | "billing" | "system";
  isRead: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Tomorrow's Breakfast Confirmed",
      message: "Your Avocado, Grilled Herb Chicken & Quinoa Super Bowl is scheduled for delivery between 7:00 AM – 8:30 AM.",
      time: "1 hour ago",
      category: "delivery",
      isRead: false,
    },
    {
      id: "2",
      title: "Invoice Settled Successfully",
      message: "Recurring subscription payment for Nu3 Power Athletic Plan has been confirmed via PayHere.",
      time: "2 days ago",
      category: "billing",
      isRead: true,
    },
    {
      id: "3",
      title: "Weekly Menu Updated",
      message: "New high-protein athletic recipes have been added to your upcoming delivery calendar.",
      time: "4 days ago",
      category: "system",
      isRead: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState<string>("ALL");

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "UNREAD") return !n.isRead;
    return n.category.toUpperCase() === activeTab;
  });

  const getIcon = (cat: string) => {
    if (cat === "delivery") return <Utensils className="w-4 h-4 text-[#15803D]" />;
    if (cat === "billing") return <Receipt className="w-4 h-4 text-purple-600" />;
    return <Sparkles className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase text-neutral-900 tracking-tight leading-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Stay updated on morning delivery drop-offs, chef updates, and invoice receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-neutral-900 font-oswald text-xs font-bold uppercase tracking-wider border border-slate-200 shadow-2xs transition-colors self-start sm:self-center"
        >
          <CheckCheck className="w-4 h-4 text-[#36D068]" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Notifications Box */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 w-fit">
          {["ALL", "UNREAD", "DELIVERY", "BILLING"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-[#36D068] text-black shadow-md shadow-[#36D068]/20"
                  : "text-slate-600 hover:text-neutral-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <Bell className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-medium text-slate-500">
              No notifications found in this view.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  n.isRead
                    ? "bg-slate-50 border-slate-200/80 hover:bg-slate-100/80"
                    : "bg-emerald-50/50 border-emerald-300 hover:bg-emerald-50 shadow-2xs"
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0 mt-0.5">
                  {getIcon(n.category)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-oswald text-sm font-bold uppercase text-neutral-900 flex items-center gap-2 truncate">
                      <span>{n.title}</span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#36D068]" />
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-500 shrink-0 flex items-center gap-1 font-poppins">
                      <Clock className="w-3 h-3 text-[#36D068]" />
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

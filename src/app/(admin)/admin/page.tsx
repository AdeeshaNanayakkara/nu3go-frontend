"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import {
  adminService,
  type AdminUserItem,
} from "@/services/api/admin.service";
import {
  mealCancellationService,
  type MealCancellationRes,
} from "@/services/api/meal-cancellation.service";
import { formatUserFriendlyError } from "@/utils/response-handler";
import {
  Users,
  UtensilsCrossed,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  UserCheck,
  CalendarX,
  Calendar,
  Ban,
  RotateCcw,
} from "lucide-react";

function getUserDisplayName(u: AdminUserItem): string {
  if (u.name && u.name.trim()) return u.name.trim();
  const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ");
  if (fullName.trim()) return fullName.trim();
  return u.email ? u.email.split("@")[0] : "Customer";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Recently";
  try {
    const clean = dateStr.split("T")[0];
    const parts = clean.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  } catch {
    return dateStr;
  }
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [recentUsers, setRecentUsers] = useState<AdminUserItem[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState<number | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Meal Cancellations
  const [recentCancellations, setRecentCancellations] = useState<MealCancellationRes[]>([]);
  const [totalCancellationsCount, setTotalCancellationsCount] = useState<number | null>(null);
  const [isLoadingCancellations, setIsLoadingCancellations] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingUsers(true);
    setIsLoadingCancellations(true);
    setUsersError(null);

    try {
      const [usersSettled, cancelSettled] = await Promise.allSettled([
        adminService.getUsers({ page: 1, limit: 5 }),
        mealCancellationService.getAllCancellations({ page: 1, limit: 5 }),
      ]);

      if (usersSettled.status === "fulfilled") {
        setRecentUsers(usersSettled.value.users);
        setTotalUsersCount(usersSettled.value.pagination.total_rows);
      } else {
        console.error("[AdminDashboardPage] Error loading customers:", usersSettled.reason);
        setUsersError(
          formatUserFriendlyError(usersSettled.reason, {
            fallback: "Failed to load recent customer registrations.",
          })
        );
      }

      if (cancelSettled.status === "fulfilled") {
        setRecentCancellations(cancelSettled.value.data || []);
        setTotalCancellationsCount(cancelSettled.value.pagination?.total ?? (cancelSettled.value.data?.length || 0));
      } else {
        console.error("[AdminDashboardPage] Error loading cancellations:", cancelSettled.reason);
      }
    } finally {
      setIsLoadingUsers(false);
      setIsLoadingCancellations(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = [
    {
      title: "Total Customers",
      value: totalUsersCount !== null ? totalUsersCount.toLocaleString() : "...",
      change: "+12.5%",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      href: "/admin/users",
    },
    {
      title: "Active Subscriptions",
      value: "482",
      change: "+8.2%",
      icon: UtensilsCrossed,
      color: "bg-[#36D068]/10 text-[#36D068] border-[#36D068]/20",
    },
    {
      title: "Meal Cancellations",
      value: totalCancellationsCount !== null ? totalCancellationsCount.toLocaleString() : "...",
      change: "Customer skips",
      icon: CalendarX,
      color: "bg-rose-50 text-rose-600 border-rose-100",
      href: "/admin/cancellations",
      highlight: true,
    },
    {
      title: "Monthly Revenue",
      value: "$24,850",
      change: "+15.3%",
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "Total Orders",
      value: "3,190",
      change: "+5.7%",
      icon: ShoppingBag,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  return (
    <div className="space-y-8 font-poppins">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-slate-500 text-xs font-medium">
              Logged in as {user?.email || "admin@nu3go.com"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Overview of Nu3go customers, meal cancellations, subscription plans, and platform metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingUsers || isLoadingCancellations ? "animate-spin text-[#36D068]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const cardContent = (
            <div
              className={`bg-white border p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all shadow-xs h-full ${
                stat.highlight ? "border-rose-200 hover:border-rose-300" : "border-slate-200/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.title}</span>
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 block font-oswald tracking-tight">{stat.value}</span>
                <span className="text-xs text-[#36D068] font-semibold flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {stat.change}
                </span>
              </div>
            </div>
          );

          if (stat.href) {
            return (
              <Link key={stat.title} href={stat.href} className="group cursor-pointer">
                {cardContent}
              </Link>
            );
          }

          return <div key={stat.title}>{cardContent}</div>;
        })}
      </div>

      {/* ─── Recent Meal Cancellations Table ─── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h2 className="text-lg font-bold text-slate-900">Recent Meal Cancellations</h2>
            </div>
            <p className="text-xs text-slate-500">
              Customer meal delivery skips recorded via GET /api/v1/meal-cancellations
            </p>
          </div>
          <Link
            href="/admin/cancellations"
            className="text-rose-600 hover:underline text-xs sm:text-sm font-semibold flex items-center gap-1"
          >
            <span>View All Cancellations</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Delivery Date</th>
                <th className="py-3 px-4">Subscription ID</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Refund Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-r-xl">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingCancellations ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#36D068]" />
                    <span className="text-xs font-medium">Loading recent meal cancellations...</span>
                  </td>
                </tr>
              ) : recentCancellations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <CalendarX className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span className="text-xs font-medium">No meal cancellations found.</span>
                  </td>
                </tr>
              ) : (
                recentCancellations.map((c) => {
                  const isReverted = Boolean(c.reverted_at);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-oswald">{formatDate(c.delivery_date)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {c.subscription_id ? `${c.subscription_id.slice(0, 8)}...` : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-slate-800 truncate max-w-xs block font-medium">
                          "{c.reason || "Customer skip"}"
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-oswald font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          {c.refund_tier || "Standard"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isReverted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            <RotateCcw className="w-3 h-3" /> Reverted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <Ban className="w-3 h-3" /> Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {formatDate(c.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Customer Registrations</h2>
            <p className="text-xs text-slate-500">Latest customer accounts created in the system</p>
          </div>
          <Link
            href="/admin/users"
            className="text-[#36D068] hover:underline text-sm font-semibold flex items-center gap-1"
          >
            View All Customers
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {usersError && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{usersError}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4 rounded-l-xl">User Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 rounded-r-xl">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#36D068]" />
                    <span className="text-xs font-medium">Loading recent customers...</span>
                  </td>
                </tr>
              ) : recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span className="text-xs font-medium">No registered customers found.</span>
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => {
                  const roleStr = (u.role || "CUSTOMER").toUpperCase();
                  const isActive = u.is_active !== false;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {getUserDisplayName(u)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            roleStr === "ADMIN"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-[#36D068]/15 text-[#2ca752] border border-[#36D068]/30"
                          }`}
                        >
                          {roleStr}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            isActive ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          ></span>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(u.created_at)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

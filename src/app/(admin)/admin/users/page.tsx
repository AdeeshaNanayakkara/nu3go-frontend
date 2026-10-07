"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  adminService,
  type AdminUserItem,
  type PaginationMeta,
} from "@/services/api/admin.service";
import { formatUserFriendlyError } from "@/utils/response-handler";
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  Shield,
  UserCheck,
  CheckCircle2,
  XCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  UserX,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    has_next: false,
    has_prev: false,
    limit: 10,
    page: 1,
    total_pages: 1,
    total_rows: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // User Status Update state
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // System Toast Notification State
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const handleToggleUserStatus = async (targetUser: AdminUserItem) => {
    const newStatus = targetUser.is_active === false; // Toggle target status
    setUpdatingUserId(targetUser.id);
    try {
      await adminService.updateUserStatus(targetUser.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: newStatus } : u))
      );
      showToast(
        newStatus
          ? `User "${targetUser.email}" activated successfully!`
          : `User "${targetUser.email}" suspended successfully!`,
        "success"
      );
    } catch (err: unknown) {
      console.error("[AdminUsersPage] Error updating user status:", err);
      showToast(
        formatUserFriendlyError(err, { fallback: "Failed to update user status." }),
        "error"
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminService.getUsers({
        page,
        limit,
        search: searchTerm.trim() || undefined,
      });

      setUsers(result.users);
      setPagination(result.pagination);
    } catch (err: unknown) {
      console.error("[AdminUsersPage] Error fetching users:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load users from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Client-side sub-filtering for role and status if backend returns raw list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      const userRole = (u.role || "CUSTOMER").toUpperCase();
      const matchesRole =
        roleFilter === "ALL" || userRole === roleFilter.toUpperCase();

      // Status filter
      const isActive = u.is_active !== false;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && isActive) ||
        (statusFilter === "INACTIVE" && !isActive);

      return matchesRole && matchesStatus;
    });
  }, [users, roleFilter, statusFilter]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (pagination.total_pages === 0 || newPage <= pagination.total_pages)) {
      setPage(newPage);
    }
  };

  // Handle Limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to page 1 on limit change
  };

  // Calculate displayed range
  const totalRows = pagination.total_rows || filteredUsers.length;
  const startRow = totalRows === 0 ? 0 : (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, totalRows);

  // Quick stats
  const adminCount = users.filter((u) => (u.role || "").toUpperCase() === "ADMIN").length;
  const customerCount = users.length - adminCount;

  return (
    <div className="space-y-8 font-poppins text-slate-900 relative">
      {/* ─── SYSTEM TOAST NOTIFICATION OVERLAY ─── */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 fade-in duration-200 ${
            toastMessage.type === "success"
              ? "bg-[#36D068] text-white border-[#2ca752]"
              : "bg-red-600 text-white border-red-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 p-0.5 hover:bg-white/20 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-slate-500 text-xs font-medium">Customer Accounts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Customer Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage registered customer profiles, verification statuses, and account access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 border border-slate-200 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Registered Users</span>
              <span className="text-xl font-bold text-slate-900">{totalRows}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Page Admins</span>
              <span className="text-xl font-bold text-slate-900">{adminCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#36D068]/10 text-[#36D068] border border-[#36D068]/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Page Customers</span>
              <span className="text-xl font-bold text-slate-900">{customerCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to page 1 when search changes
            }}
            placeholder="Search by name, email, or ID..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:border-[#36D068] focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CUSTOMER">Customer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:border-[#36D068] focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 shadow-sm text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#36D068] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Fetching users (Page {page})...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-red-700">Failed to Load Users</h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={fetchUsers}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Users Found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL"
              ? "No system users match your active filters."
              : "No user accounts have been registered yet."}
          </p>
        </div>
      ) : (
        /* Users Table Card */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Users List ({filteredUsers.length} on page)
            </h2>
            <span className="text-xs text-slate-500">
              Page {pagination.page || page} of {pagination.total_pages || 1}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">User</th>
                  <th className="py-3.5 px-4">User ID</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const displayName =
                    u.name ||
                    `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
                    u.email.split("@")[0];
                  const initial = displayName[0]?.toUpperCase() || "U";
                  const role = (u.role || "CUSTOMER").toUpperCase();
                  const isActive = u.is_active !== false;
                  const isVerified = u.is_verified ?? true;

                  const formattedDate = u.created_at
                    ? new Date(u.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* User Info & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.profile_picture_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.profile_picture_url}
                              alt={displayName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#36D068]/15 text-[#2ca752] font-bold flex items-center justify-center text-sm shrink-0">
                              {initial}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-slate-900 block capitalize">
                              {displayName}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400 inline" />
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {u.id}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                            role === "ADMIN"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-[#36D068]/15 text-[#2ca752] border border-[#36D068]/30"
                          }`}
                        >
                          {role === "ADMIN" && <Shield className="w-3 h-3 inline" />}
                          {role}
                        </span>
                      </td>

                      {/* Status */}
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
                          />
                          {isActive ? "Active" : "Suspended"}
                        </span>
                      </td>

                      {/* Verification */}
                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            Unverified
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formattedDate}
                      </td>

                      {/* Actions (Suspend / Activate) */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={updatingUserId === u.id}
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                            isActive
                              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          }`}
                          title={isActive ? "Suspend user account" : "Activate user account"}
                        >
                          {updatingUserId === u.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                          ) : isActive ? (
                            <UserX className="w-3.5 h-3.5 shrink-0 text-red-500" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          )}
                          <span>{isActive ? "Suspend" : "Activate"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ─── Pagination Controls Bar ─── */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Row Count Info */}
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-800">{startRow}</span> to{" "}
              <span className="font-semibold text-slate-800">{endRow}</span> of{" "}
              <span className="font-semibold text-slate-800">{totalRows}</span> users
            </div>

            {/* Right: Page Navigation & Per Page selector */}
            <div className="flex items-center gap-4">
              {/* Per Page Selector */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Show</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="h-8 px-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#36D068] transition-all cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>per page</span>
              </div>

              {/* Previous / Page numbers / Next controls */}
              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.has_prev && page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: pagination.total_pages || 1 }, (_, i) => i + 1)
                  .filter((pageNum) => {
                    // Show first page, last page, current page, and pages adjacent to current page
                    const totalPages = pagination.total_pages || 1;
                    return (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - page) <= 1
                    );
                  })
                  .reduce<(number | string)[]>((acc, pageNum, idx, arr) => {
                    if (idx > 0 && pageNum - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(pageNum);
                    return acc;
                  }, [])
                  .map((item, idx) => {
                    if (item === "...") {
                      return (
                        <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                          <MoreHorizontal className="w-3.5 h-3.5 inline" />
                        </span>
                      );
                    }
                    const pageNum = item as number;
                    const isCurrent = pageNum === page;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                          isCurrent
                            ? "bg-[#36D068] text-white shadow-sm"
                            : "border border-slate-200 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={
                    !pagination.has_next &&
                    (pagination.total_pages === 0 || page >= pagination.total_pages)
                  }
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

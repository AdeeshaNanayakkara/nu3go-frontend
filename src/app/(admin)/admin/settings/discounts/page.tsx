"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  discountService,
  type Discount,
  type MealPackage,
  type AssignedPackage,
} from "@/services/api/discount.service";
import {
  Percent,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Package,
  Layers,
  Check,
} from "lucide-react";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [availablePackages, setAvailablePackages] = useState<MealPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formName, setFormName] = useState("");
  const [formPercentage, setFormPercentage] = useState<string>("10");
  const [formStartDate, setFormStartDate] = useState<string>("");
  const [formEndDate, setFormEndDate] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Package Management Modal State (for assigning/unassigning packages)
  const [packageModalDiscount, setPackageModalDiscount] = useState<Discount | null>(null);
  const [assignedPackages, setAssignedPackages] = useState<AssignedPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [packagesToAssign, setPackagesToAssign] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [unassigningPackageId, setUnassigningPackageId] = useState<string | null>(null);

  // Status Toggling Loading State (by Discount ID)
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingDiscount, setDeletingDiscount] = useState<Discount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to format date for datetime-local input
  const formatForDateTimeInput = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  // Fetch Discounts & Available Packages from API
  const fetchDiscountsAndPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [discountList, packageList] = await Promise.all([
        discountService.getDiscounts(),
        discountService.getAvailablePackages().catch(() => []),
      ]);
      setDiscounts(discountList);
      setAvailablePackages(packageList);
    } catch (err: unknown) {
      console.error("[AdminDiscountsPage] Error fetching data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load discounts from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscountsAndPackages();
  }, [fetchDiscountsAndPackages]);

  // Filtered Discounts List
  const filteredDiscounts = useMemo(() => {
    return discounts.filter((discount) => {
      const matchesSearch =
        !searchTerm ||
        discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discount.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" && discount.is_active) ||
        (selectedStatus === "INACTIVE" && !discount.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [discounts, searchTerm, selectedStatus]);

  // Open Create Modal (default active: true)
  const handleOpenCreateModal = () => {
    setEditingDiscount(null);
    setFormName("");
    setFormPercentage("10");

    // Set default start_date to now and end_date to 30 days from now
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 30);

    setFormStartDate(formatForDateTimeInput(now.toISOString()));
    setFormEndDate(formatForDateTimeInput(future.toISOString()));
    setFormIsActive(true); // Create as Active by default
    setSelectedPackageIds([]);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormName(discount.name);
    setFormPercentage(String(discount.percentage || 0));
    setFormStartDate(formatForDateTimeInput(discount.start_date));
    setFormEndDate(formatForDateTimeInput(discount.end_date));
    setFormIsActive(discount.is_active);
    setSelectedPackageIds([]);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle Create / Edit Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("Discount name is required.");
      return;
    }

    const pctNum = parseFloat(formPercentage);
    if (isNaN(pctNum) || pctNum <= 0 || pctNum > 100) {
      setModalError("Please enter a valid discount percentage (1-100).");
      return;
    }

    if (!formStartDate || !formEndDate) {
      setModalError("Start date and end date are required.");
      return;
    }

    setIsSaving(true);
    setModalError(null);

    const formattedStart = new Date(formStartDate).toISOString();
    const formattedEnd = new Date(formEndDate).toISOString();

    try {
      if (editingDiscount) {
        // Update existing Discount
        await discountService.updateDiscount(editingDiscount.id, {
          name: formName.trim(),
          percentage: pctNum,
          start_date: formattedStart,
          end_date: formattedEnd,
        });
      } else {
        // Create new Discount (Active by default)
        await discountService.createDiscount({
          name: formName.trim(),
          percentage: pctNum,
          start_date: formattedStart,
          end_date: formattedEnd,
          is_active: formIsActive,
          package_ids: selectedPackageIds,
        });
      }

      setIsModalOpen(false);
      fetchDiscountsAndPackages();
    } catch (err: unknown) {
      console.error("[AdminDiscountsPage] Save error:", err);
      setModalError(
        err instanceof Error
          ? err.message
          : "Failed to save discount. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Open Package Assignment & Unassignment Modal
  const handleOpenPackageModal = async (discount: Discount) => {
    setPackageModalDiscount(discount);
    setIsLoadingPackages(true);
    setPackagesToAssign([]);
    try {
      const assigned = await discountService.getAssignedPackages(discount.id);
      setAssignedPackages(assigned);
    } catch (err) {
      console.error("[AdminDiscountsPage] Fetch assigned packages error:", err);
      setAssignedPackages([]);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  // Assign packages to discount
  const handleAssignPackagesSubmit = async () => {
    if (!packageModalDiscount || packagesToAssign.length === 0) return;
    setIsAssigning(true);
    try {
      await discountService.assignPackages(
        packageModalDiscount.id,
        packagesToAssign
      );
      // Refresh assigned packages list
      const updatedAssigned = await discountService.getAssignedPackages(
        packageModalDiscount.id
      );
      setAssignedPackages(updatedAssigned);
      setPackagesToAssign([]);
    } catch (err: unknown) {
      console.error("[AdminDiscountsPage] Assign packages error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to assign packages to discount."
      );
    } finally {
      setIsAssigning(false);
    }
  };

  // Unassign a package from discount
  const handleUnassignPackage = async (packageId: string) => {
    if (!packageModalDiscount) return;
    setUnassigningPackageId(packageId);
    try {
      await discountService.unassignPackage(
        packageModalDiscount.id,
        packageId
      );
      setAssignedPackages((prev) =>
        prev.filter((p) => p.package_id !== packageId)
      );
    } catch (err: unknown) {
      console.error("[AdminDiscountsPage] Unassign package error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to unassign package from discount."
      );
    } finally {
      setUnassigningPackageId(null);
    }
  };

  // Toggle Active / Deactive status
  const handleToggleStatus = async (discount: Discount) => {
    const newStatus = !discount.is_active;
    setTogglingStatusId(discount.id);

    try {
      await discountService.updateDiscountStatus(discount.id, newStatus);
      // Optimistic state update
      setDiscounts((prev) =>
        prev.map((d) => (d.id === discount.id ? { ...d, is_active: newStatus } : d))
      );
    } catch (err: unknown) {
      console.error("[AdminDiscountsPage] Status update error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update discount status."
      );
      fetchDiscountsAndPackages();
    } finally {
      setTogglingStatusId(null);
    }
  };

  // Delete Confirmation Execution
  const handleDeleteConfirm = async () => {
    if (!deletingDiscount) return;
    setIsDeleting(true);
    try {
      await discountService.deleteDiscount(deletingDiscount.id);
      setDeletingDiscount(null);
      fetchDiscountsAndPackages();
    } catch (err: unknown) {
      console.error("[AdminDiscountsPage] Delete error:", err);
      alert(
        err instanceof Error ? err.message : "Failed to delete discount."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 font-poppins text-slate-900">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          href="/admin/settings"
          className="flex items-center gap-1 hover:text-[#36D068] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Settings
        </Link>
        <span>/</span>
        <span className="text-slate-900">Discount Management</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Discount Portal
            </span>
            <span className="text-slate-500 text-xs font-medium">
              {discounts.length} Total Discounts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Discount Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage promotional discount offers, percentages, start & end dates, and package assignments.
          </p>
        </div>

        {/* Top-Right Action Button: Add New Discount */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-[#36D068]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Discount</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search discounts by name or ID..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
          />
        </div>

        {/* Filter & Refresh Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 h-10">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          <button
            type="button"
            onClick={fetchDiscountsAndPackages}
            disabled={isLoading}
            className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 border border-slate-200 shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh Discounts"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 shadow-sm text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#36D068] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">
            Loading discounts from server...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-red-700">Failed to Load Discounts</h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={fetchDiscountsAndPackages}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : filteredDiscounts.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm">
          <Percent className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Discounts Found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            {searchTerm || selectedStatus !== "ALL"
              ? "No discounts match your current search or filter criteria."
              : "No promotional discounts have been created yet. Click 'Add New Discount' to create your first discount offer."}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Discount</span>
          </button>
        </div>
      ) : (
        /* Discounts List Table View */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Promotional Discounts List ({filteredDiscounts.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Discount Name</th>
                  <th className="py-3.5 px-4">Rate (%)</th>
                  <th className="py-3.5 px-4">Validity Period</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Packages</th>
                  <th className="py-3.5 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDiscounts.map((discount) => {
                  const formattedStart = discount.start_date
                    ? new Date(discount.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A";

                  const formattedEnd = discount.end_date
                    ? new Date(discount.end_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A";

                  const isTogglingThis = togglingStatusId === discount.id;

                  return (
                    <tr
                      key={discount.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Discount Name & ID */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 capitalize flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#36D068]/15 text-[#2ca752] shrink-0">
                          <Percent className="w-4 h-4" />
                        </div>
                        <div>
                          <span>{discount.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono font-normal">
                            ID: {discount.id}
                          </span>
                        </div>
                      </td>

                      {/* Rate (%) */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {discount.percentage}% OFF
                        </span>
                      </td>

                      {/* Validity Period */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {formattedStart} → {formattedEnd}
                          </span>
                        </div>
                      </td>

                      {/* Status & Quick Toggle Button */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(discount)}
                          disabled={isTogglingThis}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all cursor-pointer disabled:opacity-50 ${
                            discount.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                          title={
                            discount.is_active
                              ? "Click to Deactivate"
                              : "Click to Activate"
                          }
                        >
                          {isTogglingThis ? (
                            <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                          ) : discount.is_active ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{discount.is_active ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Package Assignment Action */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleOpenPackageModal(discount)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all inline-flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                        >
                          <Package className="w-3.5 h-3.5 text-[#36D068]" />
                          <span>Manage Packages</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(discount)}
                            className="p-2 rounded-lg text-slate-500 hover:text-[#36D068] hover:bg-slate-100 transition-all cursor-pointer"
                            title="Edit Discount"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingDiscount(discount)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Delete Discount"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ADD / EDIT DISCOUNT MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#36D068]/15 text-[#36D068]">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingDiscount ? "Edit Discount" : "Add New Discount"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingDiscount
                      ? "Update discount parameters and validity period"
                      : "Configure a new promotional offer"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner in Modal */}
            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Discount Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Discount Offer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Summer Promo 2026, New Year Special"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
                />
              </div>

              {/* Percentage Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Discount Percentage (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    required
                    value={formPercentage}
                    onChange={(e) => setFormPercentage(e.target.value)}
                    placeholder="e.g. 15 or 10.5"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
                  />
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
                  />
                </div>
              </div>

              {/* Package Selection (Only shown when creating new discount) */}
              {!editingDiscount && availablePackages.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assign Packages (Optional)
                  </label>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                    {availablePackages.map((pkg) => {
                      const isSelected = selectedPackageIds.includes(pkg.id);
                      return (
                        <label
                          key={pkg.id}
                          className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900 select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPackageIds((prev) => [...prev, pkg.id]);
                              } else {
                                setSelectedPackageIds((prev) =>
                                  prev.filter((id) => id !== pkg.id)
                                );
                              }
                            }}
                            className="w-4 h-4 rounded text-[#36D068] focus:ring-[#36D068]/20 cursor-pointer"
                          />
                          <span className="font-semibold">{pkg.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Status Switch (Only shown when creating) */}
              {!editingDiscount && (
                <div className="pt-2">
                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-all">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Active Status
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {formIsActive
                          ? "Discount will be active upon creation"
                          : "Discount will be inactive upon creation"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormIsActive(!formIsActive)}
                      className="text-[#36D068] focus:outline-none cursor-pointer"
                    >
                      {formIsActive ? (
                        <ToggleRight className="w-8 h-8 text-[#36D068]" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-400" />
                      )}
                    </button>
                  </label>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all shadow-md shadow-[#36D068]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>
                      {editingDiscount ? "Update Discount" : "Create Active Discount"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ASSIGN / UNASSIGN PACKAGES MODAL ─── */}
      {packageModalDiscount && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#36D068]/15 text-[#36D068]">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Manage Discount Packages
                  </h3>
                  <p className="text-xs text-slate-500">
                    {packageModalDiscount.name} ({packageModalDiscount.percentage}% OFF)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPackageModalDiscount(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currently Assigned Packages Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Assigned Packages ({assignedPackages.length})</span>
              </h4>

              {isLoadingPackages ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  <div className="animate-spin w-5 h-5 border-2 border-[#36D068] border-t-transparent rounded-full mx-auto mb-2" />
                  Loading assigned packages...
                </div>
              ) : assignedPackages.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center">
                  No packages currently assigned to this discount.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {assignedPackages.map((ap) => {
                    // Match with package name if available
                    const matchedPkg = availablePackages.find(
                      (p) => p.id === ap.package_id
                    );
                    const isUnassigning = unassigningPackageId === ap.package_id;

                    return (
                      <div
                        key={ap.package_id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {matchedPkg ? matchedPkg.name : "Package"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {ap.package_id}
                          </span>
                        </div>

                        {/* Unassign Action */}
                        <button
                          type="button"
                          onClick={() => handleUnassignPackage(ap.package_id)}
                          disabled={isUnassigning}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-[11px] border border-red-200 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isUnassigning ? (
                            <div className="animate-spin w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          <span>Unassign</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Assign New Packages Section */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Assign Additional Packages
              </h4>

              {availablePackages.filter(
                (p) => !assignedPackages.some((ap) => ap.package_id === p.id)
              ).length === 0 ? (
                <p className="text-xs text-slate-500">
                  All available packages have already been assigned to this discount.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                    {availablePackages
                      .filter(
                        (p) =>
                          !assignedPackages.some(
                            (ap) => ap.package_id === p.id
                          )
                      )
                      .map((pkg) => {
                        const isSelected = packagesToAssign.includes(pkg.id);
                        return (
                          <label
                            key={pkg.id}
                            className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-900 select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPackagesToAssign((prev) => [
                                    ...prev,
                                    pkg.id,
                                  ]);
                                } else {
                                  setPackagesToAssign((prev) =>
                                    prev.filter((id) => id !== pkg.id)
                                  );
                                }
                              }}
                              className="w-4 h-4 rounded text-[#36D068] focus:ring-[#36D068]/20 cursor-pointer"
                            />
                            <span className="font-semibold">{pkg.name}</span>
                          </label>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    onClick={handleAssignPackagesSubmit}
                    disabled={isAssigning || packagesToAssign.length === 0}
                    className="w-full py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isAssigning ? (
                      <>
                        <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Assign {packagesToAssign.length} Selected Package(s)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Close Button */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPackageModalDiscount(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {deletingDiscount && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete Discount Offer?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this promotional discount? This action cannot be undone.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 text-left">
              <span className="text-slate-900 font-bold block capitalize text-sm">
                {deletingDiscount.name}
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                ID: {deletingDiscount.id} | Rate: {deletingDiscount.percentage}% OFF
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDiscount(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Discount</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  subscriptionPlanService,
  type SubscriptionPlan,
  type SubscriptionPlanType,
  type BillingCycle,
  BILLING_CYCLES,
} from "@/services/api/subscription-plan.service";
import {
  CreditCard,
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
  Filter,
  Repeat,
} from "lucide-react";

export default function AdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<SubscriptionPlanType>("FIXED");
  const [formBillingCycle, setFormBillingCycle] = useState<BillingCycle>("MONTHLY");
  const [formDurationLimit, setFormDurationLimit] = useState<string>("4");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Status Toggling Loading State (by Plan ID)
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Subscription Plans from API
  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await subscriptionPlanService.getSubscriptionPlans();
      setPlans(data);
    } catch (err: unknown) {
      console.error("[AdminSubscriptionPlansPage] Error fetching plans:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load subscription plans from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Filtered Plans list based on search term, type, and status
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        !searchTerm ||
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === "ALL" || plan.type === selectedType;

      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" && plan.is_active) ||
        (selectedStatus === "INACTIVE" && !plan.is_active);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [plans, searchTerm, selectedType, selectedStatus]);

  // Open modal for Creating a new plan (defaults to Active, FIXED, MONTHLY cycle)
  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setFormName("");
    setFormType("FIXED");
    setFormBillingCycle("MONTHLY");
    setFormDurationLimit("");
    setFormIsActive(true); // Create as Active by default
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal for Editing an existing plan
  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    const planType = plan.type || "FIXED";
    setFormType(planType);
    setFormBillingCycle(plan.billing_cycle || "MONTHLY");
    setFormDurationLimit(
      planType === "CUSTOM" && plan.duration_limit !== undefined && plan.duration_limit !== null
        ? String(plan.duration_limit)
        : ""
    );
    setFormIsActive(plan.is_active);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle Form Submission for Create or Update
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("Subscription plan name is required.");
      return;
    }

    if (formType === "CUSTOM") {
      const durationVal = parseInt(formDurationLimit.trim(), 10);
      if (!formDurationLimit.trim() || isNaN(durationVal) || durationVal <= 0) {
        setModalError("Please enter a valid duration limit (> 0) for Custom Plans.");
        return;
      }
    }

    setIsSaving(true);
    setModalError(null);

    const parsedDuration =
      formType === "CUSTOM" && formDurationLimit.trim()
        ? parseInt(formDurationLimit.trim(), 10)
        : undefined;

    try {
      if (editingPlan) {
        // Update existing Subscription Plan
        await subscriptionPlanService.updateSubscriptionPlan(editingPlan.id, {
          name: formName.trim(),
          type: formType,
          billing_cycle: formBillingCycle,
          duration_limit: parsedDuration,
          is_active: formIsActive,
        });
      } else {
        // Create new Subscription Plan (active by default)
        await subscriptionPlanService.createSubscriptionPlan({
          name: formName.trim(),
          type: formType,
          billing_cycle: formBillingCycle,
          duration_limit: parsedDuration,
          is_active: formIsActive,
        });
      }

      setIsModalOpen(false);
      fetchPlans();
    } catch (err: unknown) {
      console.error("[AdminSubscriptionPlansPage] Save error:", err);
      setModalError(
        err instanceof Error
          ? err.message
          : "Failed to save subscription plan. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active / Deactive status
  const handleToggleStatus = async (plan: SubscriptionPlan) => {
    const newStatus = !plan.is_active;
    setTogglingStatusId(plan.id);

    try {
      await subscriptionPlanService.updateSubscriptionPlanStatus(
        plan.id,
        newStatus
      );
      // Optimistic update
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, is_active: newStatus } : p))
      );
    } catch (err: unknown) {
      console.error("[AdminSubscriptionPlansPage] Status update error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update subscription plan status."
      );
      fetchPlans();
    } finally {
      setTogglingStatusId(null);
    }
  };

  // Handle Delete Confirmation Execution
  const handleDeleteConfirm = async () => {
    if (!deletingPlan) return;
    setIsDeleting(true);
    try {
      await subscriptionPlanService.deleteSubscriptionPlan(deletingPlan.id);
      setDeletingPlan(null);
      fetchPlans();
    } catch (err: unknown) {
      console.error("[AdminSubscriptionPlansPage] Delete error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete subscription plan."
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
        <span className="text-slate-900">Subscription Management</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Subscription Portal
            </span>
            <span className="text-slate-500 text-xs font-medium">
              {plans.length} Total Plans
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Subscription Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure subscription packages, duration limits, and toggle plan availability for customers.
          </p>
        </div>

        {/* Top-Right Action Button: Add New Subscription Plan */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-[#36D068]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Plan</span>
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
            placeholder="Search plans by name or ID..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
          />
        </div>

        {/* Filters & Refresh */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 h-10">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="FIXED">FIXED</option>
              <option value="CUSTOM">CUSTOM</option>
            </select>
          </div>

          {/* Status Filter */}
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

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchPlans}
            disabled={isLoading}
            className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 border border-slate-200 shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh Plans"
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
            Loading subscription plans from server...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-red-700">Failed to Load Plans</h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={fetchPlans}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Subscription Plans Found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            {searchTerm || selectedType !== "ALL" || selectedStatus !== "ALL"
              ? "No plans match your current search or filter criteria."
              : "No subscription plans have been created yet. Click 'Add New Plan' to create your first plan."}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Plan</span>
          </button>
        </div>
      ) : (
        /* Subscription Plans List Table View */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Subscription Plans List ({filteredPlans.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Plan Name</th>
                  <th className="py-3.5 px-4">Plan Type</th>
                  <th className="py-3.5 px-4">Billing Cycle</th>
                  <th className="py-3.5 px-4">Duration Limit</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.map((plan) => {
                  const formattedDate = plan.created_at
                    ? new Date(plan.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A";

                  const isTogglingThis = togglingStatusId === plan.id;

                  return (
                    <tr
                      key={plan.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Plan Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 capitalize flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#36D068]/15 text-[#2ca752] shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <span>{plan.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono font-normal">
                            ID: {plan.id}
                          </span>
                        </div>
                      </td>

                      {/* Plan Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            plan.type === "CUSTOM"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {plan.type}
                        </span>
                      </td>

                      {/* Billing Cycle */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Repeat className="w-3 h-3 text-emerald-600" />
                          {plan.billing_cycle || "MONTHLY"}
                        </span>
                      </td>

                      {/* Duration Limit */}
                      <td className="py-3.5 px-4 text-xs font-medium">
                        {plan.type === "CUSTOM" ? (
                          <span className="text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md font-semibold">
                            {plan.duration_limit !== undefined && plan.duration_limit !== null
                              ? `${plan.duration_limit} Days/Units`
                              : "Custom Limit"}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal italic">
                            Fixed (N/A)
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formattedDate}
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(plan)}
                          disabled={isTogglingThis}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all cursor-pointer disabled:opacity-50 ${
                            plan.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                          title={
                            plan.is_active
                              ? "Click to Deactivate"
                              : "Click to Activate"
                          }
                        >
                          {isTogglingThis ? (
                            <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                          ) : plan.is_active ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{plan.is_active ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(plan)}
                            className="p-2 rounded-lg text-slate-500 hover:text-[#36D068] hover:bg-slate-100 transition-all cursor-pointer"
                            title="Edit Plan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPlan(plan)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Delete Plan"
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

      {/* ─── ADD / EDIT SUBSCRIPTION PLAN MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#36D068]/15 text-[#36D068]">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingPlan ? "Edit Subscription Plan" : "Add Subscription Plan"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingPlan
                      ? "Update plan configuration details"
                      : "Create a new plan for customer packages"}
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
              {/* Plan Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Fixed Weekly Plan, Custom Monthly Plan"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
                  />
                </div>
              </div>

              {/* Plan Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Plan Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("FIXED");
                      setFormDurationLimit("");
                    }}
                    className={`h-11 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      formType === "FIXED"
                        ? "bg-[#36D068]/15 border-[#36D068] text-[#2ca752]"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    FIXED
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormType("CUSTOM");
                      if (!formDurationLimit) setFormDurationLimit("30");
                    }}
                    className={`h-11 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      formType === "CUSTOM"
                        ? "bg-purple-100 border-purple-400 text-purple-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    CUSTOM
                  </button>
                </div>
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Billing Cycle <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Repeat className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={formBillingCycle}
                    onChange={(e) => setFormBillingCycle(e.target.value as BillingCycle)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all cursor-pointer"
                  >
                    {BILLING_CYCLES.map((bc) => (
                      <option key={bc.value} value={bc.value}>
                        {bc.label} ({bc.value}) — {bc.description}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Defines the recurring charging cadence for subscribers of this plan.
                </p>
              </div>

              {/* Duration Limit — ONLY ASKED IF CUSTOM PLAN TYPE */}
              {formType === "CUSTOM" ? (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Duration Limit (Days / Units) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="1"
                      required
                      value={formDurationLimit}
                      onChange={(e) => setFormDurationLimit(e.target.value)}
                      placeholder="e.g. 14, 20, 30 days"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-purple-200 bg-white text-slate-900 placeholder:text-purple-300 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-purple-700">
                    Custom plans require specifying a duration limit (e.g. 14, 20, or 30 days) for customer meal selection schedules.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#36D068] shrink-0" />
                  <span>Fixed plans do not require a duration limit and follow the selected {formBillingCycle} billing cycle.</span>
                </div>
              )}

              {/* Active Status Switch */}
              <div className="pt-2">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/80 transition-all">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Active Status
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {formIsActive
                        ? "Plan will be active & visible upon creation"
                        : "Plan will be inactive upon creation"}
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
                      {editingPlan ? "Update Plan" : "Create Active Plan"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {deletingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete Subscription Plan?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this subscription plan? This action cannot be undone.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 text-left">
              <span className="text-slate-900 font-bold block capitalize text-sm">
                {deletingPlan.name}
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                ID: {deletingPlan.id} | Type: {deletingPlan.type}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPlan(null)}
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
                  <span>Delete Plan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

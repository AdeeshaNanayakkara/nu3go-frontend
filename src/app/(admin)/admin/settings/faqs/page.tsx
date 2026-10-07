"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { faqService, type FAQItem } from "@/services/api/faq.service";
import {
  HelpCircle,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
  ArrowLeft,
  Hash,
} from "lucide-react";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Accordion open items state
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirmation Modal state
  const [deletingFaq, setDeletingFaq] = useState<FAQItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch FAQs from API
  const fetchFaqs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await faqService.getFaqs();
      setFaqs(data);
      // Expand the first FAQ by default if list is non-empty
      if (data.length > 0) {
        setExpandedIds((prev) => ({ ...prev, [data[0].id]: true }));
      }
    } catch (err: unknown) {
      console.error("[AdminFaqsPage] Error fetching FAQs:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load FAQs from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Filtered & Sorted FAQs
  const filteredFaqs = useMemo(() => {
    return faqs
      .filter((faq) => {
        const matchesSearch =
          !searchTerm ||
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "ACTIVE" && faq.is_active !== false) ||
          (statusFilter === "INACTIVE" && faq.is_active === false);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [faqs, searchTerm, statusFilter]);

  // Toggle Accordion item
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingFaq(null);
    setFormQuestion("");
    setFormAnswer("");
    setFormDisplayOrder(faqs.length + 1);
    setFormIsActive(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormDisplayOrder(faq.display_order ?? 1);
    setFormIsActive(faq.is_active !== false);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle Create / Update Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      setModalError("Both Question and Answer are required.");
      return;
    }

    setIsSaving(true);
    setModalError(null);

    try {
      if (editingFaq) {
        // Update existing FAQ
        await faqService.updateFaq(editingFaq.id, {
          question: formQuestion.trim(),
          answer: formAnswer.trim(),
          display_order: Number(formDisplayOrder) || 1,
          is_active: formIsActive,
        });
      } else {
        // Create new FAQ
        await faqService.createFaq({
          question: formQuestion.trim(),
          answer: formAnswer.trim(),
          display_order: Number(formDisplayOrder) || 1,
          is_active: formIsActive,
        });
      }

      setIsModalOpen(false);
      fetchFaqs();
    } catch (err: unknown) {
      console.error("[AdminFaqsPage] Save error:", err);
      setModalError(
        err instanceof Error ? err.message : "Failed to save FAQ. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete execution
  const handleDeleteConfirm = async () => {
    if (!deletingFaq) return;
    setIsDeleting(true);
    try {
      await faqService.deleteFaq(deletingFaq.id);
      setDeletingFaq(null);
      fetchFaqs();
    } catch (err: unknown) {
      console.error("[AdminFaqsPage] Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete FAQ.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 font-poppins text-slate-900">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          href="/admin/settings"
          className="flex items-center gap-1 hover:text-[#36D068] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Settings
        </Link>
        <span>/</span>
        <span className="text-slate-900">FAQ Management</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              FAQ Portal
            </span>
            <span className="text-slate-500 text-xs font-medium">
              {faqs.length} Total FAQs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage customer-facing FAQ questions, answers, display ordering, and visibility status.
          </p>
        </div>

        {/* Top-Right Action Button: Add New FAQ */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-[#36D068]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New FAQ</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
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

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchFaqs}
            disabled={isLoading}
            className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 border border-slate-200 shadow-sm disabled:opacity-50"
            title="Refresh FAQs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main FAQ List */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 shadow-sm text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#36D068] border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Loading FAQs from server...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-red-700">Failed to Load FAQs</h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={fetchFaqs}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No FAQs Found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            {searchTerm || statusFilter !== "ALL"
              ? "No FAQs match your search or status filter."
              : "No FAQs have been added yet. Click 'Add New FAQ' to create one."}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create First FAQ</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isExpanded = !!expandedIds[faq.id];
            const isActive = faq.is_active !== false;

            return (
              <div
                key={faq.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-slate-300"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(faq.id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none bg-white hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Order Pill */}
                    <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      #{faq.display_order ?? index + 1}
                    </span>

                    {/* Question Text */}
                    <h3 className="font-semibold text-slate-900 text-base leading-snug truncate">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Pill */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                        isActive
                          ? "bg-[#36D068]/15 text-[#2ca752] border border-[#36D068]/30"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Inactive
                        </>
                      )}
                    </span>

                    {/* Action Buttons: Edit & Delete */}
                    <div
                      className="flex items-center gap-1 pl-2 border-l border-slate-200"
                      onClick={(e) => e.stopPropagation()} // Stop accordion toggle
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(faq)}
                        className="p-2 rounded-lg text-slate-500 hover:text-[#36D068] hover:bg-slate-100 transition-all"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingFaq(faq)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Chevron Toggle */}
                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#36D068]" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Answer Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40">
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line pl-11">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── ADD / EDIT FAQ MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#36D068]/15 text-[#36D068]">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingFaq ? "Edit FAQ" : "Add New FAQ"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingFaq ? "Update FAQ details" : "Create a new question & answer pair"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner in modal */}
            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Question */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. What is Nu3Go?"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="e.g. Nu3Go is a healthy meal subscription platform offering flexible meal plans..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Display Order */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] transition-all"
                    />
                  </div>
                </div>

                {/* Is Active Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <label className="flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 accent-[#36D068] rounded cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      {formIsActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all shadow-md shadow-[#36D068]/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingFaq ? "Update FAQ" : "Create FAQ"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {deletingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete FAQ?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this FAQ question? This action cannot be undone.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 text-left line-clamp-2">
              &quot;{deletingFaq.question}&quot;
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingFaq(null)}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete FAQ</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

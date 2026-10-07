"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  mealService,
  type MealItem,
} from "@/services/api/meal.service";
import type { PaginationMeta } from "@/services/api/admin.service";
import Link from "next/link";
import {
  UtensilsCrossed,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export default function AdminServicesPage() {
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    has_next: false,
    has_prev: false,
    limit: 12,
    page: 1,
    total_pages: 1,
    total_rows: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(12);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");

  // Image Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Modal state
  const [deletingMeal, setDeletingMeal] = useState<MealItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch meals from API
  const fetchMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mealService.getMeals({
        page,
        limit,
        search: searchTerm.trim() || undefined,
      });

      setMeals(result.meals);
      setPagination(result.pagination);
    } catch (err: unknown) {
      console.error("[AdminServicesPage] Error fetching meals:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load meals from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      (pagination.total_pages === 0 || newPage <= pagination.total_pages)
    ) {
      setPage(newPage);
    }
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingMeal(null);
    setFormName("");
    setFormDescription("");
    setFormImageUrl("");
    setSelectedFile(null);
    setImagePreview(null);
    setUploadSuccess(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (meal: MealItem) => {
    setEditingMeal(meal);
    setFormName(meal.name);
    setFormDescription(meal.description || "");
    setFormImageUrl(meal.image_url || "");
    setSelectedFile(null);
    setImagePreview(meal.image_url || null);
    setUploadSuccess(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Handle File Select & Auto-Upload via /images/upload/meal
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setModalError(null);
    setUploadSuccess(false);
    setIsUploadingImage(true);

    try {
      const uploadedUrl = await mealService.uploadMealImage(file);
      setFormImageUrl(uploadedUrl);
      setUploadSuccess(true);
    } catch (err: unknown) {
      console.error("[AdminServicesPage] Image upload failed:", err);
      setModalError(
        err instanceof Error ? err.message : "Failed to upload meal image."
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle Create / Update Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("Meal name is required.");
      return;
    }

    if (isUploadingImage) {
      setModalError("Please wait for image upload to complete.");
      return;
    }

    setIsSaving(true);
    setModalError(null);

    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        image_url: formImageUrl.trim(),
      };

      if (editingMeal) {
        await mealService.updateMeal(editingMeal.id, payload);
      } else {
        await mealService.createMeal(payload);
      }

      setIsModalOpen(false);
      fetchMeals();
    } catch (err: unknown) {
      console.error("[AdminServicesPage] Save error:", err);
      setModalError(
        err instanceof Error ? err.message : "Failed to save meal. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete execution
  const handleDeleteConfirm = async () => {
    if (!deletingMeal) return;
    setIsDeleting(true);
    try {
      await mealService.deleteMeal(deletingMeal.id);
      setDeletingMeal(null);
      fetchMeals();
    } catch (err: unknown) {
      console.error("[AdminServicesPage] Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete meal.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate displayed range
  const totalRows = pagination.total_rows || meals.length;
  const startRow = totalRows === 0 ? 0 : (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, totalRows);

  return (
    <div className="space-y-8 font-poppins text-slate-900">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link
          href="/admin"
          className="flex items-center gap-1 hover:text-[#36D068] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-900">Meal Management</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Meal Portal
            </span>
            <span className="text-slate-500 text-xs font-medium">Meal Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Services & Meals Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure meal items, descriptions, and uploaded images for user subscription plans.
          </p>
        </div>

        {/* Top-Right Action Button: Add New Meal */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-[#36D068]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Meal</span>
          </button>
        </div>
      </div>

      {/* Search & Refresh Bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search meals by name or description..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={fetchMeals}
            disabled={isLoading}
            className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center gap-2 border border-slate-200 shadow-sm disabled:opacity-50 cursor-pointer"
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
          <p className="text-slate-500 text-sm font-medium">Loading meal catalog from server...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-red-700">Failed to Load Meals</h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={fetchMeals}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : meals.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-sm">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Meals Found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            {searchTerm
              ? "No meals match your search query."
              : "No meals have been added to the catalog yet."}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Meal</span>
          </button>
        </div>
      ) : (
        /* 1:1 Aspect Ratio Meal Cards Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col aspect-square relative"
              >
                {/* Image Top Container (55% Height) */}
                <div className="h-[55%] w-full bg-slate-100 relative overflow-hidden shrink-0">
                  {meal.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={meal.image_url}
                      alt={meal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <UtensilsCrossed className="w-12 h-12" />
                    </div>
                  )}

                  {/* Top Action Overlay Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-95 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(meal)}
                      className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-[#36D068] hover:bg-white shadow-sm transition-all"
                      title="Edit Meal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingMeal(meal)}
                      className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-red-600 hover:bg-white shadow-sm transition-all"
                      title="Delete Meal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Content Container (45% Height) */}
                <div className="p-4 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-[#36D068] transition-colors">
                      {meal.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {meal.description || "No description provided."}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>ID: {meal.id.slice(0, 8)}...</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(meal)}
                      className="text-[#36D068] font-bold hover:underline"
                    >
                      Edit →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Pagination Controls ─── */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-800">{startRow}</span> to{" "}
              <span className="font-semibold text-slate-800">{endRow}</span> of{" "}
              <span className="font-semibold text-slate-800">{totalRows}</span> meals
            </div>

            <div className="flex items-center gap-4">
              {/* Per Page Selector */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Show</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 px-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#36D068] transition-all cursor-pointer"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
                <span>per page</span>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.has_prev && page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: pagination.total_pages || 1 }, (_, i) => i + 1)
                  .filter((pageNum) => {
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

      {/* ─── ADD / EDIT MEAL MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#36D068]/15 text-[#36D068]">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingMeal ? "Edit Meal" : "Add New Meal"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingMeal ? "Update meal details & image" : "Create a new meal item for subscriptions"}
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
              {/* Image Upload Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Meal Image
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-[#36D068] rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition-all relative">
                  {imagePreview ? (
                    <div className="relative group w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-6 cursor-pointer space-y-2">
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-slate-500">
                        <Upload className="w-6 h-6 text-[#36D068]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#36D068] hover:underline">
                          Click to upload image
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          PNG, JPG, WEBP up to 5MB
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* Uploading indicator */}
                  {isUploadingImage && (
                    <div className="mt-2 text-xs text-[#36D068] font-semibold flex items-center justify-center gap-1.5">
                      <div className="animate-spin w-3.5 h-3.5 border-2 border-[#36D068] border-t-transparent rounded-full" />
                      Uploading image...
                    </div>
                  )}

                  {/* Upload success indicator */}
                  {uploadSuccess && (
                    <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Image uploaded successfully!
                    </div>
                  )}
                </div>
              </div>

              {/* Meal Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Meal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Grilled Chicken Salad"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Fresh organic greens with grilled chicken breast, cherry tomatoes, and light vinaigrette dressing..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-[#36D068] focus:ring-2 focus:ring-[#36D068]/20 transition-all resize-y"
                />
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
                  disabled={isSaving || isUploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2fc25e] text-white font-semibold text-sm transition-all shadow-md shadow-[#36D068]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingMeal ? "Update Meal" : "Create Meal"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      {deletingMeal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Meal?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this meal item from the catalog?
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 text-left flex items-center gap-3">
              {deletingMeal.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={deletingMeal.image_url}
                  alt={deletingMeal.name}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                />
              )}
              <div>
                <span className="font-bold text-slate-900 block">{deletingMeal.name}</span>
                <span className="text-slate-400 font-mono text-[10px]">ID: {deletingMeal.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMeal(null)}
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
                  <span>Delete Meal</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

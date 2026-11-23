"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  reviewService,
  type ReviewRes,
  type ReviewSummaryRes,
  type ReviewPaginationMeta,
} from "@/services/api/review.service";
import { toast } from "@/lib/toast";
import {
  Star,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Calendar,
  User,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  MessageSquare,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Loader2,
} from "lucide-react";

type StatusFilter = "ALL" | "PUBLISHED" | "PENDING";
type RatingFilter = "ALL" | "5" | "4" | "3" | "2" | "1";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRes[]>([]);
  const [summary, setSummary] = useState<ReviewSummaryRes | null>(null);
  const [pagination, setPagination] = useState<ReviewPaginationMeta>({
    page: 1,
    limit: 20,
    total_pages: 1,
    total_rows: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Expanded comment text
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Modals state
  const [selectedReview, setSelectedReview] = useState<ReviewRes | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Edit Modal State
  const [editingReview, setEditingReview] = useState<ReviewRes | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editComment, setEditComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Modal State
  const [deletingReview, setDeletingReview] = useState<ReviewRes | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Visibility toggle in-flight ID
  const [togglingId, setTogglingId] = useState<string | null>(null);

  /**
   * Fetch reviews from backend via BFF using standard asynchronous effect
   */
  useEffect(() => {
    let isCancelled = false;

    async function loadReviews() {
      try {
        const isPublishedParam =
          statusFilter === "PUBLISHED" ? true : statusFilter === "PENDING" ? false : undefined;
        const ratingParam = ratingFilter !== "ALL" ? Number(ratingFilter) : undefined;

        const [reviewsRes, summaryRes] = await Promise.all([
          reviewService.getAdminReviews({
            page: currentPage,
            limit: 20,
            is_published: isPublishedParam,
            rating: ratingParam,
          }),
          reviewService.getReviewSummary().catch(() => null),
        ]);

        if (!isCancelled) {
          const items = Array.isArray(reviewsRes?.data) ? reviewsRes.data : [];
          setReviews(items);
          if (reviewsRes?.pagination) {
            setPagination(reviewsRes.pagination);
          }
          if (summaryRes) {
            setSummary(summaryRes);
          }
          setError(null);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("[AdminReviewsPage] Error loading reviews:", err);
          const errMsg =
            err instanceof Error
              ? err.message
              : "Failed to load customer reviews from backend.";
          setError(errMsg);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadReviews();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, statusFilter, ratingFilter, refreshTrigger]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  /**
   * Client-side search filtering on loaded reviews (safeguarded against non-array values)
   */
  const filteredReviews = useMemo(() => {
    const list = Array.isArray(reviews) ? reviews : [];
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (r) =>
        r?.reviewer_name?.toLowerCase().includes(term) ||
        r?.reviewer_email?.toLowerCase().includes(term) ||
        r?.title?.toLowerCase().includes(term) ||
        r?.comment?.toLowerCase().includes(term) ||
        r?.id?.toLowerCase().includes(term)
    );
  }, [reviews, searchTerm]);

  /**
   * KPI calculations integrating /public/reviews/summary API + Admin Review Listing
   */
  const kpiStats = useMemo(() => {
    const list = Array.isArray(reviews) ? reviews : [];

    // 1. Published count: /public/reviews/summary provides aggregate total_reviews of approved reviews
    const publishedCount =
      summary?.total_reviews !== undefined
        ? summary.total_reviews
        : list.filter((r) => Boolean(r?.is_published)).length;

    // 2. Pending moderation count: from current list or derived
    const pendingInList = list.filter((r) => !r?.is_published).length;

    // 3. Total submissions (all logged customer reviews):
    // In admin list, pagination.total_rows represents total rows. When not filtered by status, it is the total across the entire DB.
    const totalCount =
      statusFilter === "ALL" && pagination.total_rows !== undefined && pagination.total_rows > 0
        ? pagination.total_rows
        : Math.max(
            pagination.total_rows || 0,
            list.length,
            publishedCount + pendingInList
          );

    const pendingCount =
      statusFilter === "PENDING" && pagination.total_rows !== undefined
        ? pagination.total_rows
        : Math.max(pendingInList, totalCount - publishedCount);

    // 4. Average rating: directly from /public/reviews/summary API
    let avg = "0.0";
    if (summary && summary.total_reviews > 0) {
      avg = Number(summary.average_rating || 0).toFixed(1);
    } else if (publishedCount > 0) {
      const pubReviews = list.filter((r) => r.is_published);
      if (pubReviews.length > 0) {
        avg = (pubReviews.reduce((a, b) => a + (b.rating || 0), 0) / pubReviews.length).toFixed(1);
      }
    } else if (list.length > 0) {
      // Fallback if none are published yet: average of received submissions
      avg = (list.reduce((a, b) => a + (b.rating || 0), 0) / list.length).toFixed(1);
    }

    // 5. 5-star count: from /public/reviews/summary distribution or loaded list
    const fiveStarCount =
      summary?.distribution?.["5"] !== undefined
        ? summary.distribution["5"]
        : list.filter((r) => r?.rating === 5).length;

    return {
      total: totalCount,
      avg,
      published: publishedCount,
      pending: pendingCount,
      fiveStar: fiveStarCount,
    };
  }, [summary, pagination, reviews, statusFilter]);

  /**
   * Toggle Publish / Hide Visibility
   */
  const handleToggleVisibility = async (review: ReviewRes) => {
    const newStatus = !review.is_published;
    setTogglingId(review.id);

    try {
      const updated = await reviewService.setReviewVisibility(review.id, newStatus);
      // Optimistic update
      setReviews((prev) =>
        Array.isArray(prev)
          ? prev.map((r) =>
              r.id === review.id
                ? {
                    ...r,
                    is_published: updated?.is_published ?? newStatus,
                    published_at: updated?.published_at ?? (newStatus ? new Date().toISOString() : undefined),
                  }
                : r
            )
          : []
      );

      toast.success(
        newStatus
          ? `Review by ${review.reviewer_name || "Customer"} is now published publicly.`
          : `Review hidden from public website.`
      );

      // Re-fetch aggregate review summary from /public/reviews/summary API
      const updatedSummary = await reviewService.getReviewSummary().catch(() => null);
      if (updatedSummary) {
        setSummary(updatedSummary);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle review visibility.";
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  /**
   * Open Edit Review Modal
   */
  const handleOpenEditModal = (review: ReviewRes) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditTitle(review.title || "");
    setEditComment(review.comment);
    setEditError(null);
  };

  /**
   * Save Edited Review
   */
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    if (editComment.trim().length < 10) {
      setEditError("Review comment must be at least 10 characters.");
      return;
    }

    setIsUpdating(true);
    setEditError(null);

    try {
      const updated = await reviewService.updateReview(editingReview.id, {
        rating: editRating,
        title: editTitle.trim() || undefined,
        comment: editComment.trim(),
      });

      setReviews((prev) =>
        Array.isArray(prev)
          ? prev.map((r) =>
              r.id === editingReview.id
                ? {
                    ...r,
                    rating: updated?.rating ?? editRating,
                    title: updated?.title ?? editTitle.trim(),
                    comment: updated?.comment ?? editComment.trim(),
                    updated_at: new Date().toISOString(),
                  }
                : r
            )
          : []
      );

      toast.success("Review updated successfully.");
      setEditingReview(null);

      // Re-fetch aggregate review summary
      const updatedSummary = await reviewService.getReviewSummary().catch(() => null);
      if (updatedSummary) {
        setSummary(updatedSummary);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update review.";
      setEditError(msg);
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete Review Action
   */
  const handleConfirmDelete = async () => {
    if (!deletingReview) return;
    setIsDeleting(true);

    try {
      await reviewService.deleteReview(deletingReview.id);
      setReviews((prev) => (Array.isArray(prev) ? prev.filter((r) => r.id !== deletingReview.id) : []));
      toast.success("Review deleted successfully.");
      setDeletingReview(null);

      // Re-fetch aggregate review summary
      const updatedSummary = await reviewService.getReviewSummary().catch(() => null);
      if (updatedSummary) {
        setSummary(updatedSummary);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete review.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCommentExpand = (id: string) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "—";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-8 font-poppins text-slate-900 pb-16">
      {/* ─── Breadcrumb & Top Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#36D068] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Settings</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="bg-[#36D068]/15 text-[#36D068] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Feedback Moderation
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-oswald uppercase">
            Customer Reviews Management
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1 max-w-2xl">
            Moderate community feedback, publish verified customer reviews, analyze rating distributions, and manage meal experience ratings.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-xs disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#36D068] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── KPI Cards Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Average Rating */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-[#36D068]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-oswald">
              Average Rating
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-oswald text-slate-900 tracking-tight">
              {kpiStats.avg}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(Number(kpiStats.avg))
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                }`}
              />
            ))}
            <span className="text-[11px] text-slate-500 font-medium ml-1.5">
              Based on {kpiStats.published} published {kpiStats.published === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        {/* KPI 2: Total Reviews */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-[#36D068]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-oswald">
              Total Submissions
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-oswald text-slate-900 tracking-tight">
            {kpiStats.total}
          </div>
          <p className="text-xs text-slate-500 font-light mt-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#36D068]" />
            <span>Customer stories logged</span>
          </p>
        </div>

        {/* KPI 3: Published Reviews */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-[#36D068]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-oswald">
              Published on Site
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#36D068] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-oswald text-slate-900 tracking-tight">
            {kpiStats.published}
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Visible to public visitors</span>
          </p>
        </div>

        {/* KPI 4: Pending Moderation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-[#36D068]/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-oswald">
              Pending Moderation
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-oswald text-slate-900 tracking-tight">
            {kpiStats.pending}
          </div>
          <p className="text-xs text-amber-700 font-medium mt-2 flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
            <span>Awaiting admin publication</span>
          </p>
        </div>
      </div>

      {/* ─── Rating Distribution Breakdown (from /public/reviews/summary API) ─── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#36D068]" />
            <h3 className="font-oswald text-base font-bold uppercase text-slate-900 tracking-wider">
              Rating Distribution
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Based on {kpiStats.published} published {kpiStats.published === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary?.distribution?.[String(star)] ?? 0;
            const total = summary?.total_reviews || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div
                key={star}
                className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-1">
                    {star} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                  </span>
                  <span className="text-slate-500 font-normal">{count} ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#36D068] h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reviewer name, email, title, or review text..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:bg-white focus:ring-1 focus:ring-[#36D068] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl shrink-0">
            {(
              [
                { key: "ALL", label: "All Status" },
                { key: "PUBLISHED", label: "Published" },
                { key: "PENDING", label: "Pending" },
              ] as const
            ).map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => {
                  setStatusFilter(st.key);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider font-oswald transition-all cursor-pointer ${
                  statusFilter === st.key
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Star Rating Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500 font-oswald uppercase tracking-wider">
              Stars:
            </span>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value as RatingFilter);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#36D068] cursor-pointer"
            >
              <option value="ALL">All Stars</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Error Notice ─── */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="font-bold underline hover:text-red-950 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Reviews Data List / Table ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#36D068] animate-spin mb-3" />
            <p className="text-sm text-slate-500 font-medium font-poppins">
              Loading reviews from server...
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="font-oswald text-lg font-bold uppercase text-slate-800 mb-1">
              No Reviews Found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mb-4 font-light">
              {searchTerm || statusFilter !== "ALL" || ratingFilter !== "ALL"
                ? "No customer reviews match your active filter criteria."
                : "No customer reviews have been submitted yet."}
            </p>
            {(searchTerm || statusFilter !== "ALL" || ratingFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setRatingFilter("ALL");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((review) => {
              const isExpanded = !!expandedComments[review.id];
              const isLong = (review.comment || "").length > 180;
              const displayText =
                !isExpanded && isLong ? `${(review.comment || "").slice(0, 180)}...` : review.comment;
              const isToggling = togglingId === review.id;

              return (
                <div
                  key={review.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-start justify-between gap-6"
                >
                  {/* Left Column: Reviewer, Rating, Text */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Top Meta: Stars, Title, Status badge */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Star Rating Visual */}
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-amber-800 ml-1 font-oswald">
                          {review.rating}.0
                        </span>
                      </div>

                      {/* Review Title Headline */}
                      {review.title && (
                        <h4 className="font-oswald text-base font-bold uppercase text-slate-900 tracking-tight">
                          {review.title}
                        </h4>
                      )}

                      {/* Publication Status Pill */}
                      {review.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider font-oswald bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider font-oswald bg-amber-100/70 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending Moderation</span>
                        </span>
                      )}
                    </div>

                    {/* Review Comment Text */}
                    <p className="text-sm text-slate-700 leading-relaxed font-normal">
                      &ldquo;{displayText}&rdquo;
                    </p>

                    {isLong && (
                      <button
                        type="button"
                        onClick={() => toggleCommentExpand(review.id)}
                        className="text-xs font-semibold text-[#36D068] hover:text-emerald-700 underline cursor-pointer"
                      >
                        {isExpanded ? "Show less" : "Read full review"}
                      </button>
                    )}

                    {/* Reviewer Details Footer */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-light">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <div className="w-6 h-6 rounded-full bg-[#36D068]/20 text-[#36D068] font-oswald font-bold flex items-center justify-center text-[10px]">
                          {(review.reviewer_name || review.reviewer_email || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {review.reviewer_name || "Subscriber"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{review.reviewer_email}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Submitted {formatDate(review.created_at)}</span>
                      </div>

                      {review.is_published && review.published_at && (
                        <div className="flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Published {formatDate(review.published_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Moderation Actions */}
                  <div className="shrink-0 flex items-center gap-2 self-start lg:self-center">
                    {/* Toggle Visibility Button */}
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggleVisibility(review)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-oswald transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
                        review.is_published
                          ? "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-slate-200"
                          : "bg-[#36D068] text-white hover:bg-emerald-600 shadow-emerald-500/20"
                      }`}
                      title={review.is_published ? "Hide from public view" : "Publish to live website"}
                    >
                      {isToggling ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : review.is_published ? (
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-white" />
                      )}
                      <span>{review.is_published ? "Hide" : "Publish"}</span>
                    </button>

                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReview(review);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Inspect review metadata"
                    >
                      <User className="w-4 h-4" />
                    </button>

                    {/* Edit Review */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(review)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                      title="Edit review content"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Review */}
                    <button
                      type="button"
                      onClick={() => setDeletingReview(review)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Pagination Controls ─── */}
        {pagination.total_pages && pagination.total_pages > 1 && (
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing Page <strong>{pagination.page || 1}</strong> of{" "}
              <strong>{pagination.total_pages}</strong> ({pagination.total_rows || (Array.isArray(reviews) ? reviews.length : 0)} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                disabled={currentPage >= (pagination.total_pages || 1) || isLoading}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL 1: Detail / Inspection Modal ─── */}
      {isDetailModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#36D068]/15 text-[#36D068] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#36D068] font-oswald">
                  Review Metadata
                </span>
                <h3 className="font-oswald text-xl font-black uppercase text-slate-900">
                  Customer Story Detail
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Review ID</span>
                  <span className="font-mono text-slate-700 select-all">{selectedReview.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">User ID</span>
                  <span className="font-mono text-slate-700 select-all">{selectedReview.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reviewer Name</span>
                  <span className="font-semibold text-slate-900">{selectedReview.reviewer_name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reviewer Email</span>
                  <span className="font-semibold text-slate-900">{selectedReview.reviewer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created Date</span>
                  <span className="text-slate-700">{formatDate(selectedReview.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Published Status</span>
                  <span className={selectedReview.is_published ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                    {selectedReview.is_published ? "Published (Live)" : "Pending Moderation"}
                  </span>
                </div>
                {selectedReview.published_by_user_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Published By (Admin ID)</span>
                    <span className="font-mono text-slate-700">{selectedReview.published_by_user_id}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="font-bold font-oswald uppercase text-slate-600 tracking-wider block mb-1">
                  Headline:
                </span>
                <p className="text-sm font-semibold text-slate-900">{selectedReview.title || "—"}</p>
              </div>

              <div>
                <span className="font-bold font-oswald uppercase text-slate-600 tracking-wider block mb-1">
                  Full Customer Comment:
                </span>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
                  {selectedReview.comment}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-oswald font-bold uppercase text-xs tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Edit Review Modal ─── */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => setEditingReview(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-oswald">
                  Admin Editing
                </span>
                <h3 className="font-oswald text-xl font-black uppercase text-slate-900">
                  Edit Customer Review
                </h3>
              </div>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-oswald font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                  Rating (1–5 Stars)
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => setEditRating(s)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= editRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 font-oswald ml-2">
                    {editRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-oswald font-bold uppercase text-slate-700 tracking-wider mb-1">
                  Headline / Title <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={120}
                  disabled={isUpdating}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#36D068] focus:ring-1 focus:ring-[#36D068]"
                  placeholder="e.g. Healthy and on time"
                />
              </div>

              {/* Comment */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-oswald font-bold uppercase text-slate-700 tracking-wider">
                    Review Comment *
                  </label>
                  <span className="text-[11px] text-slate-400">{editComment.length}/2000</span>
                </div>
                <textarea
                  required
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                  disabled={isUpdating}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#36D068] focus:ring-1 focus:ring-[#36D068] resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setEditingReview(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || editComment.trim().length < 10}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-oswald text-xs font-bold uppercase tracking-wider bg-[#36D068] text-white hover:bg-emerald-600 transition-colors shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: Delete Review Confirmation Modal ─── */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="font-oswald text-xl font-bold uppercase text-slate-900 mb-2">
              Delete This Review?
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete the review submitted by{" "}
              <strong>{deletingReview.reviewer_name || deletingReview.reviewer_email}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingReview(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-oswald font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-oswald text-xs font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

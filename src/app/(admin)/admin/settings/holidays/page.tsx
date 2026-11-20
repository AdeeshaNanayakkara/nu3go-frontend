"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Trash2,
  Pencil,
  Plus,
  Lock,
  Send,
  Info,
} from "lucide-react";
import {
  holidayService,
  type HolidayRes,
} from "@/services/api/holiday.service";
import { cn } from "@/lib/utils";

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(ymd: string): string {
  try {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return ymd;
  }
}

type ModalState =
  | { mode: "create"; date: string }
  | { mode: "edit"; holiday: HolidayRes }
  | null;

export default function HolidayManagementPage() {
  const todayYMD = formatYMD(new Date());

  const [monthDate, setMonthDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [holidays, setHolidays] = useState<HolidayRes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal state
  const [modal, setModal] = useState<ModalState>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "publish" | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Publish confirmation dialog — holds the draft holidays about to be published
  const [publishTarget, setPublishTarget] = useState<HolidayRes[] | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  // Visible month range for API query
  const { fromDate, toDate } = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    return { fromDate: formatYMD(first), toDate: formatYMD(last) };
  }, [year, month]);

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await holidayService.listHolidays({
        from: fromDate,
        to: toDate,
        limit: 100,
      });
      setHolidays(res.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load holidays.");
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Map of date -> holiday for quick cell lookups
  const holidayMap = useMemo(() => {
    const map: Record<string, HolidayRes> = {};
    holidays.forEach((h) => {
      if (h.date) map[h.date.slice(0, 10)] = h;
    });
    return map;
  }, [holidays]);

  const draftCount = holidays.filter((h) => h.status === "DRAFT").length;
  const publishedCount = holidays.filter((h) => h.status === "PUBLISHED").length;

  // Full month grid: Monday-start weeks covering the entire month
  const calendarCells = useMemo(() => {
    const cells: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isWeekend: boolean;
      isPast: boolean;
      isToday: boolean;
    }> = [];

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    // Walk back to Monday
    const start = new Date(firstOfMonth);
    const startDow = start.getDay(); // 0 Sun .. 6 Sat
    start.setDate(start.getDate() - (startDow === 0 ? 6 : startDow - 1));

    // Walk forward to Sunday
    const end = new Date(lastOfMonth);
    const endDow = end.getDay();
    end.setDate(end.getDate() + (endDow === 0 ? 0 : 7 - endDow));

    const cursor = new Date(start);
    while (cursor <= end) {
      const dow = cursor.getDay();
      // Weekends hidden — weekdays only (Mon–Fri)
      if (dow >= 1 && dow <= 5) {
        const str = formatYMD(cursor);
        cells.push({
          dateStr: str,
          dayNum: cursor.getDate(),
          isCurrentMonth: cursor.getMonth() === month,
          isWeekend: false,
          isPast: str < todayYMD,
          isToday: str === todayYMD,
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return cells;
  }, [year, month, todayYMD]);

  const handlePrevMonth = () =>
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleToday = () => {
    const now = new Date();
    setMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const flashSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // ─── Cell click: open create or edit modal ───
  const handleCellClick = (cell: (typeof calendarCells)[number]) => {
    const existing = holidayMap[cell.dateStr];

    if (existing) {
      setModal({ mode: "edit", holiday: existing });
      setFormName(existing.name || "");
      setFormDescription(existing.description || "");
      setFormDate(existing.date?.slice(0, 10) || cell.dateStr);
      setConfirmAction(null);
      setModalError(null);
      return;
    }

    // No creating on weekends or past dates
    if (cell.isWeekend || cell.isPast) return;

    setModal({ mode: "create", date: cell.dateStr });
    setFormName("");
    setFormDescription("");
    setFormDate(cell.dateStr);
    setConfirmAction(null);
    setModalError(null);
  };

  const closeModal = () => {
    setModal(null);
    setConfirmAction(null);
    setModalError(null);
  };

  const isWeekendYMD = (ymd: string): boolean => {
    const [y, m, d] = ymd.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    return dow === 0 || dow === 6;
  };

  // ─── Create draft holiday ───
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal || modal.mode !== "create") return;

    if (formName.trim().length < 2) {
      setModalError("Holiday name is required (at least 2 characters).");
      return;
    }
    if (isWeekendYMD(formDate)) {
      setModalError("Weekends are locked — pick a weekday (Mon–Fri).");
      return;
    }

    setIsSaving(true);
    setModalError(null);
    try {
      await holidayService.createHolidays([
        {
          date: formDate,
          name: formName.trim(),
          description: formDescription.trim() || undefined,
        },
      ]);
      closeModal();
      flashSuccess(`Draft holiday "${formName.trim()}" created for ${formDate}.`);
      fetchHolidays();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Failed to create holiday.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Update draft holiday ───
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal || modal.mode !== "edit") return;

    if (formName.trim().length < 2) {
      setModalError("Holiday name is required (at least 2 characters).");
      return;
    }
    if (isWeekendYMD(formDate)) {
      setModalError("Weekends are locked — pick a weekday (Mon–Fri).");
      return;
    }

    setIsSaving(true);
    setModalError(null);
    try {
      await holidayService.updateHoliday(modal.holiday.id, {
        date: formDate,
        name: formName.trim(),
        description: formDescription.trim() || undefined,
      });
      closeModal();
      flashSuccess(`Holiday "${formName.trim()}" updated.`);
      fetchHolidays();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Failed to update holiday.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete draft holiday ───
  const handleDelete = async () => {
    if (!modal || modal.mode !== "edit") return;
    setIsDeleting(true);
    setModalError(null);
    try {
      await holidayService.deleteHoliday(modal.holiday.id);
      closeModal();
      flashSuccess(`Draft holiday "${modal.holiday.name}" deleted.`);
      fetchHolidays();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Failed to delete holiday.");
      setConfirmAction(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Open the publish confirmation dialog ───
  const openPublishConfirm = (targets: HolidayRes[]) => {
    if (targets.length === 0) return;
    setPublishTarget(targets);
    setPublishError(null);
  };

  // ─── Publish after confirmation ───
  const handleConfirmPublish = async () => {
    if (!publishTarget || publishTarget.length === 0) return;

    setIsPublishing(true);
    setPublishError(null);
    try {
      await holidayService.publishHolidays(publishTarget.map((h) => h.id));
      const count = publishTarget.length;
      setPublishTarget(null);
      closeModal();
      flashSuccess(
        count === 1
          ? `Holiday "${publishTarget[0].name}" published. Affected customers are being compensated.`
          : `${count} draft holidays published. Affected customers are being compensated.`
      );
      fetchHolidays();
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : "Failed to publish holidays.");
    } finally {
      setIsPublishing(false);
    }
  };

  const isEditingDraft = modal?.mode === "edit" && modal.holiday.status === "DRAFT";
  const isViewingPublished = modal?.mode === "edit" && modal.holiday.status === "PUBLISHED";

  // Holidays of the visible month, sorted for the list below the calendar
  const monthHolidays = useMemo(
    () => [...holidays].sort((a, b) => (a.date || "").localeCompare(b.date || "")),
    [holidays]
  );

  return (
    <div className="space-y-6 font-poppins text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#36D068] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="bg-[#36D068]/15 text-[#36D068] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Holiday Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Holiday Calendar
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Click a day to draft a holiday. Click an existing holiday to view, edit, delete, or publish it. Weekends are hidden (no deliveries).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Publish all drafts (POST /holidays/publications) */}
          <button
            type="button"
            onClick={() => openPublishConfirm(holidays.filter((h) => h.status === "DRAFT"))}
            disabled={draftCount === 0 || isPublishing}
            title={
              draftCount === 0
                ? "No draft holidays to publish this month"
                : `Publish all ${draftCount} draft holiday${draftCount > 1 ? "s" : ""} of this month`
            }
            className="px-3.5 py-2.5 rounded-xl bg-[#36D068] hover:bg-[#2ca752] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#36D068]/20"
          >
            <Send className="w-4 h-4" />
            <span>Publish Drafts</span>
          </button>

          <div className="text-center bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
            <p className="text-xl font-black text-amber-600 leading-none">{draftCount}</p>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-1">Drafts</p>
          </div>

          <div className="text-center bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5">
            <p className="text-xl font-black text-emerald-600 leading-none">{publishedCount}</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-1">Published</p>
          </div>
        </div>
      </div>

      {/* Success / Error banners */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchHolidays}
            className="text-xs font-bold text-red-700 underline cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Calendar Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#36D068]/10 text-[#36D068]">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {monthDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </h2>
            {isLoading && <RefreshCw className="w-4 h-4 text-[#36D068] animate-spin" />}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Draft holiday
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Published holiday
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            Weekends hidden (no deliveries)
          </span>
        </div>

        {/* Weekday header (Mon–Fri only, weekends hidden) */}
        <div className="grid grid-cols-5 gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 pb-1.5 border-b border-slate-100">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-5 gap-1.5">
          {calendarCells.map((cell) => {
            const holiday = holidayMap[cell.dateStr];
            const isDraft = holiday?.status === "DRAFT";
            const isPublished = holiday?.status === "PUBLISHED";
            const clickable = Boolean(holiday) || (!cell.isWeekend && !cell.isPast);

            return (
              <button
                key={cell.dateStr}
                type="button"
                disabled={!clickable}
                onClick={() => handleCellClick(cell)}
                title={
                  holiday
                    ? `${holiday.name} (${holiday.status})`
                    : cell.isPast
                    ? "Past date"
                    : "Click to add a holiday"
                }
                className={cn(
                  "min-h-16 sm:min-h-20 rounded-xl border text-left p-1.5 sm:p-2 flex flex-col gap-1 transition-all select-none relative",
                  holiday
                    ? isDraft
                      ? "bg-amber-50 border-amber-300 hover:border-amber-400 hover:shadow-sm cursor-pointer"
                      : "bg-emerald-50 border-emerald-300 hover:border-emerald-400 hover:shadow-sm cursor-pointer"
                    : cell.isPast
                    ? "bg-slate-50/50 border-slate-100 text-slate-300 cursor-not-allowed"
                    : cell.isCurrentMonth
                    ? "bg-white border-slate-200 hover:border-[#36D068] hover:bg-emerald-50/40 hover:shadow-sm cursor-pointer group"
                    : "bg-slate-50/40 border-slate-100 hover:border-[#36D068]/60 hover:bg-emerald-50/30 cursor-pointer"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-bold leading-none",
                      cell.isToday
                        ? "bg-[#0B3B17] text-white rounded-md px-1.5 py-1"
                        : cell.isCurrentMonth
                        ? cell.isPast
                          ? "text-slate-400"
                          : "text-slate-800"
                        : "text-slate-400"
                    )}
                  >
                    {cell.dayNum}
                  </span>
                  {!holiday && !cell.isPast && (
                    <Plus className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                {holiday && (
                  <div
                    className={cn(
                      "mt-auto rounded-md px-1.5 py-1 text-[10px] font-bold leading-tight truncate flex items-center gap-1",
                      isDraft
                        ? "bg-amber-400/90 text-amber-950"
                        : "bg-emerald-500/90 text-white"
                    )}
                  >
                    <span className="truncate">{holiday.name}</span>
                  </div>
                )}
                {holiday && (
                  <span
                    className={cn(
                      "text-[8.5px] font-black uppercase tracking-wider leading-none",
                      isDraft ? "text-amber-600" : "text-emerald-600"
                    )}
                  >
                    {isDraft ? "Draft" : "Published"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-100">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>
            Drafts have no effect until published. Publishing credits FIXED subscriptions, releases CUSTOM days, and emails affected customers. Published holidays cannot be edited or deleted.
          </span>
        </div>
      </div>

      {/* Month holiday list */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Holidays in {monthDate.toLocaleString("en-US", { month: "long", year: "numeric" })} ({monthHolidays.length})
        </h3>
        {monthHolidays.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No holidays this month. Click a weekday on the calendar to draft one.
          </p>
        ) : (
          <div className="divide-y divide-slate-50">
            {monthHolidays.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0 flex items-center gap-3">
                  <span
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0",
                      h.status === "DRAFT" ? "bg-amber-400" : "bg-emerald-500"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{h.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatDisplayDate(h.date?.slice(0, 10) || "")}
                      {h.description ? ` — ${h.description}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                      h.status === "DRAFT"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {h.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setModal({ mode: "edit", holiday: h });
                      setFormName(h.name || "");
                      setFormDescription(h.description || "");
                      setFormDate(h.date?.slice(0, 10) || "");
                      setConfirmAction(null);
                      setModalError(null);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                    title={h.status === "DRAFT" ? "Edit draft" : "View holiday"}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Create / Edit Modal ─── */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "p-2 rounded-xl",
                    modal.mode === "create"
                      ? "bg-[#36D068]/10 text-[#36D068]"
                      : isViewingPublished
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-500"
                  )}
                >
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {modal.mode === "create"
                      ? "New Draft Holiday"
                      : isViewingPublished
                      ? "Published Holiday"
                      : "Edit Draft Holiday"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {formatDisplayDate(modal.mode === "create" ? modal.date : formDate || modal.holiday.date?.slice(0, 10) || "")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {isViewingPublished ? (
              /* Published: read-only view */
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Name</span>
                    <span className="text-sm font-bold text-slate-900">{modal.holiday.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                    <span className="text-sm font-medium text-slate-700">
                      {formatDisplayDate(modal.holiday.date?.slice(0, 10) || "")}
                    </span>
                  </div>
                  {modal.holiday.description && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</span>
                      <span className="text-xs text-slate-600">{modal.holiday.description}</span>
                    </div>
                  )}
                  {modal.holiday.published_at && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Published At</span>
                      <span className="text-xs text-slate-600">{modal.holiday.published_at}</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>This holiday is published. Published holidays cannot be edited or deleted.</span>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Create / Edit draft form */
              <form
                onSubmit={modal.mode === "create" ? handleCreate : handleUpdate}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Holiday Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    maxLength={120}
                    placeholder="e.g. Thai Pongal"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#36D068]/40 focus:border-[#36D068]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    min={todayYMD}
                    onChange={(e) => e.target.value && setFormDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#36D068]/40 focus:border-[#36D068] cursor-pointer"
                  />
                  {isWeekendYMD(formDate) && (
                    <p className="text-[11px] text-amber-600 font-semibold mt-1">
                      Selected date falls on a weekend — weekends are locked.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Description <span className="text-slate-400 normal-case font-medium">(optional)</span>
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="e.g. Public holiday — kitchen closed"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#36D068]/40 focus:border-[#36D068] resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSaving || isDeleting || isPublishing}
                    className="w-full py-3 rounded-2xl bg-[#0B3B17] hover:bg-[#124D20] text-white text-sm font-bold transition-all shadow-md shadow-[#0B3B17]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : modal.mode === "create" ? (
                      <Plus className="w-4 h-4 text-[#36D068]" />
                    ) : (
                      <Pencil className="w-4 h-4 text-[#36D068]" />
                    )}
                    <span>
                      {isSaving
                        ? "Saving..."
                        : modal.mode === "create"
                        ? "Create Draft Holiday"
                        : "Save Changes"}
                    </span>
                  </button>

                  {isEditingDraft && (
                    <div className="grid grid-cols-2 gap-2">
                      {/* Publish */}
                      <button
                        type="button"
                        onClick={() => openPublishConfirm([modal.holiday])}
                        disabled={isSaving || isDeleting || isPublishing}
                        className="py-2.5 rounded-2xl bg-[#36D068] hover:bg-[#2ca752] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-sm shadow-[#36D068]/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>

                      {/* Delete */}
                      {confirmAction === "delete" ? (
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>{isDeleting ? "Deleting..." : "Confirm Delete?"}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmAction("delete")}
                          disabled={isSaving || isDeleting || isPublishing}
                          className="py-2.5 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Draft</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── Publish Confirmation Dialog ─── */}
      {publishTarget && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Dialog header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Publish {publishTarget.length > 1 ? `${publishTarget.length} Holidays` : "Holiday"}?
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPublishTarget(null)}
                disabled={isPublishing}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{publishError}</span>
              </div>
            )}

            {/* Warning */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-medium leading-relaxed">
              <span className="font-bold block mb-1">⚠ Double-check the dates before publishing!</span>
              You <span className="font-bold">cannot make changes after holidays are published</span> — published holidays can never be edited or deleted. FIXED subscriptions will be credited, CUSTOM days released, and affected customers emailed immediately.
            </div>

            {/* Holidays to be published */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 max-h-52 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {publishTarget.length > 1 ? "Holidays to publish" : "Holiday to publish"}
              </span>
              {publishTarget.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-2 bg-white border border-slate-200/80 rounded-xl px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{h.name}</p>
                    <p className="text-[11px] text-slate-400">{formatDisplayDate(h.date?.slice(0, 10) || "")}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider shrink-0">
                    Draft
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPublishTarget(null)}
                disabled={isPublishing}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                disabled={isPublishing}
                className="py-3 rounded-2xl bg-[#36D068] hover:bg-[#2ca752] text-white text-sm font-bold transition-all shadow-md shadow-[#36D068]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isPublishing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isPublishing ? "Publishing..." : "Yes, Publish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

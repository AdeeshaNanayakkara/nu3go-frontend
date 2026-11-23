"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Lock, type LucideIcon } from "lucide-react";

/** Native-style bottom sheet: dimmed backdrop, drag handle, safe-area aware. */
export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-200"
      />
      <div className="relative w-full max-h-[90dvh] overflow-y-auto rounded-t-[28px] bg-white px-5 pt-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
        <h3 className="font-oswald text-lg font-bold uppercase tracking-tight text-neutral-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

/** Settings-style list row: icon tile, label, value, chevron (or lock). */
export function ListRow({
  icon: Icon,
  label,
  value,
  placeholder,
  locked,
  onClick,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  placeholder?: string;
  locked?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const missing = !value && !!placeholder;
  const content = (
    <>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          missing ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-[#15803D]"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-oswald text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span
          className={`block truncate text-[15px] font-semibold leading-snug ${
            missing ? "text-amber-600" : "text-neutral-900"
          }`}
        >
          {value || placeholder || ""}
        </span>
      </span>
      {locked ? (
        <Lock className="h-4 w-4 shrink-0 text-slate-300" />
      ) : (
        <>
          {missing && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />}
          <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
        </>
      )}
    </>
  );

  const className =
    "flex min-h-[64px] w-full touch-manipulation items-center gap-3 px-4 py-2 transition-colors active:bg-slate-50";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  if (locked || !onClick) {
    return <div className={`${className} ${locked ? "opacity-80" : ""}`}>{content}</div>;
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

/** Titled, rounded card that stacks ListRows with dividers. */
export function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="px-2 font-oswald text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        {children}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BottomSheet, Group, ListRow } from "@/components/mobile/mobile-ui";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  ChevronRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Receipt,
  UtensilsCrossed,
  Bell,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export interface ProfileValues {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
}

type FieldKey = keyof ProfileValues;

interface FieldConfig {
  label: string;
  icon: LucideIcon;
  placeholder: string;
  hint: string;
  min: number;
  maxLength: number;
  type: "text" | "tel";
  autoComplete: string;
}

const FIELDS: Record<FieldKey, FieldConfig> = {
  firstName: {
    label: "First name",
    icon: User,
    placeholder: "Kasun",
    hint: "Recipient first name",
    min: 1,
    maxLength: 100,
    type: "text",
    autoComplete: "given-name",
  },
  lastName: {
    label: "Last name",
    icon: User,
    placeholder: "Perera",
    hint: "Family surname",
    min: 1,
    maxLength: 100,
    type: "text",
    autoComplete: "family-name",
  },
  phone: {
    label: "Phone number",
    icon: Phone,
    placeholder: "0771234567",
    hint: "Used for driver drop-off SMS and delivery updates (at least 7 digits)",
    min: 7,
    maxLength: 20,
    type: "tel",
    autoComplete: "tel",
  },
  address: {
    label: "Street address",
    icon: MapPin,
    placeholder: "123 Galle Rd, Apt 4B",
    hint: "Morning drop-off and billing address (at least 3 characters)",
    min: 3,
    maxLength: 255,
    type: "text",
    autoComplete: "street-address",
  },
  city: {
    label: "City / region",
    icon: Building2,
    placeholder: "Colombo",
    hint: "Used for zoning and dispatch (at least 2 characters)",
    min: 2,
    maxLength: 100,
    type: "text",
    autoComplete: "address-level2",
  },
};

const PERSONAL_FIELDS: FieldKey[] = ["firstName", "lastName", "phone"];
const DELIVERY_FIELDS: FieldKey[] = ["address", "city"];

interface ProfileMobileViewProps {
  email: string;
  values: ProfileValues;
  onChange: (field: FieldKey, value: string) => void;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  errorMsg: string | null;
  completion: { percentage: number; completed: number; total: number };
  onSave: () => void;
  onRefresh: () => void;
  onLogout: () => Promise<void>;
}

export function ProfileMobileView({
  email,
  values,
  onChange,
  isDirty,
  isLoading,
  isSaving,
  errorMsg,
  completion,
  onSave,
  onRefresh,
  onLogout,
}: ProfileMobileViewProps) {
  const [editingField, setEditingField] = useState<FieldKey | null>(null);
  const [draft, setDraft] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fullName = `${values.firstName} ${values.lastName}`.trim();
  const displayName = fullName || email.split("@")[0] || "Customer";

  const isFieldComplete = (key: FieldKey) => values[key].trim().length >= FIELDS[key].min;
  const firstIncomplete = useMemo(
    () => ([...PERSONAL_FIELDS, ...DELIVERY_FIELDS] as FieldKey[]).find((k) => values[k].trim().length < FIELDS[k].min),
    [values],
  );

  const openField = (key: FieldKey) => {
    setDraft(values[key]);
    setEditingField(key);
  };
  const closeSheet = () => setEditingField(null);

  useEffect(() => {
    if (editingField) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [editingField]);

  const field = editingField ? FIELDS[editingField] : null;
  const draftValid = field ? draft.trim().length >= field.min : false;

  const applyDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField || !draftValid) return;
    onChange(editingField, draft.trim());
    closeSheet();
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
      setShowLogout(false);
    }
  };

  const ringColor =
    completion.percentage === 100 ? "#36D068" : completion.percentage >= 50 ? "#FBBF24" : "#F43F5E";

  return (
    <div className={`font-poppins space-y-5 animate-in fade-in duration-300 ${isDirty ? "pb-28" : "pb-6"}`}>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B3B17] via-[#0E491D] to-[#07240E] px-5 pb-5 pt-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#36D068]/20 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#36D068] to-emerald-300 font-oswald text-3xl font-black text-slate-950 shadow-lg shadow-black/30 ring-4 ring-white/15">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <h1 className="mt-3 max-w-full truncate font-oswald text-2xl font-bold capitalize tracking-tight">{displayName}</h1>
          <p className="max-w-full truncate text-xs text-emerald-100/80">{email}</p>
        </div>

        <div className="relative mt-5 rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              {completion.percentage === 100 ? (
                <CheckCircle2 className="h-4 w-4 text-[#36D068]" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-300" />
              )}
              {completion.percentage === 100 ? "Profile complete" : "Complete your profile"}
            </span>
            <span className="font-oswald tracking-wider">
              {completion.completed}/{completion.total}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.max(completion.percentage, 4)}%`, backgroundColor: ringColor }}
            />
          </div>
          {firstIncomplete && (
            <button
              type="button"
              onClick={() => openField(firstIncomplete)}
              className="mt-3 flex h-11 w-full touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-[#36D068] font-oswald text-xs font-bold uppercase tracking-wider text-slate-950 transition-transform active:scale-[0.98]"
            >
              Add {FIELDS[firstIncomplete].label.toLowerCase()}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {errorMsg && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse" aria-busy="true">
          <div className="h-48 rounded-3xl bg-slate-200/70" />
          <div className="h-32 rounded-3xl bg-slate-200/70" />
        </div>
      ) : (
        <>
          <Group title="Personal">
            {PERSONAL_FIELDS.map((key) => (
              <ListRow
                key={key}
                icon={FIELDS[key].icon}
                label={FIELDS[key].label}
                value={values[key]}
                placeholder={isFieldComplete(key) ? undefined : `Add ${FIELDS[key].label.toLowerCase()}`}
                onClick={() => openField(key)}
              />
            ))}
            <ListRow icon={Mail} label="Email (account ID)" value={email} locked />
          </Group>

          <Group title="Delivery & billing">
            {DELIVERY_FIELDS.map((key) => (
              <ListRow
                key={key}
                icon={FIELDS[key].icon}
                label={FIELDS[key].label}
                value={values[key]}
                placeholder={isFieldComplete(key) ? undefined : `Add ${FIELDS[key].label.toLowerCase()}`}
                onClick={() => openField(key)}
              />
            ))}
          </Group>

          <Group title="My account">
            <ListRow icon={UtensilsCrossed} label="Plans" value="My subscriptions" href="/orders" />
            <ListRow icon={Receipt} label="Finance" value="Billing & invoices" href="/payments" />
            <ListRow icon={MapPin} label="Settings" value="Delivery addresses" href="/settings" />
            <ListRow icon={Bell} label="Alerts" value="Notifications" href="/notifications" />
          </Group>

          <button
            type="button"
            onClick={onRefresh}
            className="mx-auto flex h-10 touch-manipulation items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-slate-500 active:bg-slate-200/60"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh profile
          </button>

          <button
            type="button"
            onClick={() => setShowLogout(true)}
            className="flex h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-3xl border border-rose-200 bg-white font-oswald text-sm font-bold uppercase tracking-wider text-rose-600 shadow-xs transition-colors active:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </>
      )}

      {/* Sticky save bar */}
      {isDirty && !isLoading && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-[#0B3B17] font-oswald text-sm font-bold uppercase tracking-wider text-white shadow-md transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-[#36D068]" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4 text-[#36D068]" />
                Save changes
              </>
            )}
          </button>
        </div>
      )}

      {/* Field editor sheet */}
      <BottomSheet open={!!editingField} title={field ? `Edit ${field.label.toLowerCase()}` : ""} onClose={closeSheet}>
        {field && (
          <form onSubmit={applyDraft} className="space-y-3">
            <input
              ref={inputRef}
              type={field.type}
              inputMode={field.type === "tel" ? "tel" : undefined}
              autoComplete={field.autoComplete}
              maxLength={field.maxLength}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={field.placeholder}
              enterKeyHint="done"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-medium text-neutral-900 placeholder:text-slate-400 focus:border-[#36D068] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#36D068]/20"
            />
            <p className="px-1 text-xs leading-relaxed text-slate-500">{field.hint}</p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={closeSheet}
                className="h-12 flex-1 touch-manipulation rounded-2xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 active:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!draftValid}
                className="flex h-12 flex-[1.4] touch-manipulation items-center justify-center gap-1.5 rounded-2xl bg-[#36D068] font-oswald text-sm font-bold uppercase tracking-wider text-slate-950 transition-transform active:scale-[0.98] disabled:opacity-40"
              >
                <Check className="h-4 w-4" />
                Done
              </button>
            </div>
          </form>
        )}
      </BottomSheet>

      {/* Sign out confirmation sheet */}
      <BottomSheet open={showLogout} title="Sign out of Nu3Go?" onClose={() => !isLoggingOut && setShowLogout(false)}>
        <p className="mb-5 text-sm leading-relaxed text-slate-500">
          You will need to sign back in to manage your meal subscriptions and deliveries.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => setShowLogout(false)}
            className="h-12 flex-1 touch-manipulation rounded-2xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 active:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={confirmLogout}
            className="h-12 flex-1 touch-manipulation rounded-2xl bg-rose-600 font-oswald text-sm font-bold uppercase tracking-wider text-white active:bg-rose-700 disabled:opacity-60"
          >
            {isLoggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

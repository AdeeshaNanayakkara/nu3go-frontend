"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { userService, type BillingProfileRes } from "@/services/api/user.service";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertCircle,
  Save,
  MapPin,
  Building2,
  RefreshCw,
  Sparkles,
  ArrowDown,
  Check,
} from "lucide-react";

export default function UserProfilePage() {
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch billing profile from /api/v1/me/profile on mount
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data: BillingProfileRes | null = await userService.getBillingProfile();
      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setCity(data.city || "");
      } else if (user?.email) {
        // Fallback name guessing if profile has not been populated yet
        const parts = user.email.split("@")[0].split(".");
        setFirstName(parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "Nu3Go");
        setLastName(parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "Customer");
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setErrorMsg("Failed to load profile details. Please try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation matching backend /api/v1/me/profile schema
    if (!firstName.trim()) {
      setErrorMsg("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      setErrorMsg("Last name is required.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setErrorMsg("Please enter a valid phone number (at least 7 digits).");
      return;
    }
    if (!address.trim() || address.trim().length < 3) {
      setErrorMsg("Street address is required (at least 3 characters).");
      return;
    }
    if (!city.trim() || city.trim().length < 2) {
      setErrorMsg("City is required (at least 2 characters).");
      return;
    }

    setIsSaving(true);
    try {
      // Execute PUT /api/v1/me/profile with { first_name, last_name, phone, address, city }
      const updated = await userService.updateBillingProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
      });

      if (updated) {
        if (updated.first_name) setFirstName(updated.first_name);
        if (updated.last_name) setLastName(updated.last_name);
        if (updated.phone) setPhone(updated.phone);
        if (updated.address) setAddress(updated.address);
        if (updated.city) setCity(updated.city);
      }

      if (user) {
        setUser({
          ...user,
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        });
      }

      setSuccessMsg("Profile details updated successfully via PUT /api/v1/me/profile!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);
      const msg =
        err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : (user?.email ? user.email.split("@")[0] : "Customer");

  // ─── 6 Registration Detail Completion Criteria ───
  const checklistItems = [
    {
      id: "first_name",
      label: "First Name",
      category: "Identity",
      value: firstName.trim(),
      isComplete: firstName.trim().length > 0,
      icon: User,
      hint: "Recipient first name",
      locked: false,
    },
    {
      id: "last_name",
      label: "Last Name",
      category: "Identity",
      value: lastName.trim(),
      isComplete: lastName.trim().length > 0,
      icon: User,
      hint: "Family surname",
      locked: false,
    },
    {
      id: "email",
      label: "Email Address",
      category: "Account",
      value: user?.email || "",
      isComplete: Boolean(user?.email && user.email.includes("@")),
      icon: Mail,
      hint: "Verified account login",
      locked: true,
    },
    {
      id: "phone",
      label: "Phone Number",
      category: "Contact",
      value: phone.trim(),
      isComplete: phone.trim().length >= 7,
      icon: Phone,
      hint: "Driver drop-off SMS",
      locked: false,
    },
    {
      id: "address",
      label: "Street Address",
      category: "Delivery",
      value: address.trim(),
      isComplete: address.trim().length >= 3,
      icon: MapPin,
      hint: "Delivery morning drop-off",
      locked: false,
    },
    {
      id: "city",
      label: "City / Region",
      category: "Delivery",
      value: city.trim(),
      isComplete: city.trim().length >= 2,
      icon: Building2,
      hint: "Zoning & dispatch hub",
      locked: false,
    },
  ];

  const completedCount = checklistItems.filter((i) => i.isComplete).length;
  const totalCount = checklistItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  const firstIncompleteField = checklistItems.find((i) => !i.isComplete && !i.locked);

  const handleFocusField = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
  };

  // Circular gauge circumference for r=38
  const strokeCircumference = 238.76;
  const strokeOffset = strokeCircumference - (strokeCircumference * completionPercentage) / 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B3B17]/10 text-[#0B3B17] font-oswald text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-[#36D068]" />
            <span>ACCOUNT &amp; BILLING IDENTITY</span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase text-neutral-900 tracking-tight leading-tight">
            Profile &amp; Delivery Details
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Manage your personal identity, contact phone, and primary delivery destination for active meal plans.
          </p>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={fetchProfile}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#36D068]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ─── Profile Setup Completion Percentage Viewer ─── */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0B3B17] via-[#0E491D] to-[#07240E] text-white p-6 sm:p-7 shadow-lg border border-[#36D068]/30 relative overflow-hidden space-y-6">
        {/* Glow ambient decoration */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#36D068]/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Summary Row */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* SVG Circular Progress Gauge */}
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="7"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke={completionPercentage === 100 ? "#36D068" : completionPercentage >= 50 ? "#FBBF24" : "#F43F5E"}
                  strokeWidth="7"
                  strokeDasharray={strokeCircumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-oswald text-xl font-black text-white tracking-tight">
                  {completionPercentage}%
                </span>
                <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider font-oswald -mt-1">
                  Done
                </span>
              </div>
            </div>

            {/* Description & Headline */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {completionPercentage === 100 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#36D068] border border-[#36D068]/40 text-[10px] font-bold uppercase tracking-wider font-oswald flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>All Details Registered (6/6)</span>
                  </span>
                ) : completionPercentage >= 50 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider font-oswald flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{completedCount} of {totalCount} Details Completed</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 text-[10px] font-bold uppercase tracking-wider font-oswald flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Action Needed ({completedCount}/{totalCount} Completed)</span>
                  </span>
                )}
              </div>

              <h2 className="font-oswald text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                Registration Detail Completion
              </h2>
              <p className="text-xs text-emerald-100/80 max-w-xl leading-relaxed">
                {completionPercentage === 100
                  ? "Your account registration details are 100% complete! Your morning drop-off address and contact phone are active for driver deliveries."
                  : `Please complete the remaining ${totalCount - completedCount} detail${totalCount - completedCount > 1 ? "s" : ""} below to enable smooth subscription checkout and seamless morning meal drop-offs.`}
              </p>
            </div>
          </div>

          {/* Action button if incomplete */}
          {firstIncompleteField && (
            <button
              type="button"
              onClick={() => handleFocusField(firstIncompleteField.id)}
              className="relative z-10 self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#36D068] hover:bg-[#2fb85b] text-slate-950 font-oswald text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <span>Fill {firstIncompleteField.label}</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Linear Progress Bar */}
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-200">
            <span>Profile Progress</span>
            <span className="font-oswald tracking-wider">{completedCount} of {totalCount} steps complete</span>
          </div>
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                completionPercentage === 100
                  ? "bg-gradient-to-r from-[#36D068] to-emerald-300"
                  : completionPercentage >= 50
                  ? "bg-gradient-to-r from-amber-400 to-[#36D068]"
                  : "bg-gradient-to-r from-rose-500 to-amber-400"
              }`}
              style={{ width: `${Math.max(completionPercentage, 5)}%` }}
            />
          </div>
        </div>

        {/* 6 Registration Detail Checklist Cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {checklistItems.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={item.locked}
              onClick={() => handleFocusField(item.id)}
              className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between group cursor-pointer ${
                item.isComplete
                  ? "bg-white/10 hover:bg-white/15 border-white/15 text-white shadow-2xs"
                  : "bg-amber-950/35 hover:bg-amber-950/55 border-amber-500/40 text-amber-100 shadow-2xs"
              } ${item.locked ? "cursor-default opacity-85" : "hover:scale-[1.02] active:scale-[0.98]"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    item.isComplete
                      ? "bg-[#36D068]/20 text-[#36D068]"
                      : "bg-amber-500/25 text-amber-300"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                {item.locked ? (
                  <span className="text-[9px] font-bold text-slate-300 font-oswald flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-full border border-white/20">
                    <Lock className="w-2.5 h-2.5 text-slate-300" />
                    LOCKED
                  </span>
                ) : item.isComplete ? (
                  <span className="text-[9px] font-bold text-[#36D068] font-oswald flex items-center gap-0.5 bg-[#36D068]/20 px-1.5 py-0.5 rounded-full">
                    <Check className="w-2.5 h-2.5" />
                    DONE
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-300 font-oswald flex items-center gap-0.5 bg-amber-500/25 px-1.5 py-0.5 rounded-full animate-pulse">
                    <AlertCircle className="w-2.5 h-2.5" />
                    NEEDED
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-bold leading-tight font-oswald uppercase tracking-wider truncate">
                  {item.label}
                </div>
                <div className="text-[10px] text-white/70 truncate mt-0.5 font-normal">
                  {item.isComplete
                    ? item.value.length > 15
                      ? item.value.slice(0, 13) + "..."
                      : item.value
                    : item.hint}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card Header */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#36D068] to-emerald-400 flex items-center justify-center text-slate-950 font-oswald font-black text-2xl shadow-md shadow-[#36D068]/20 shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-oswald text-xl font-bold uppercase text-neutral-900 capitalize tracking-tight">
                {displayName}
              </h2>
              {completionPercentage === 100 ? (
                <span className="font-oswald text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#36D068]" />
                  <span>100% Profile Complete</span>
                </span>
              ) : (
                <span className="font-oswald text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span>{completionPercentage}% Complete ({completedCount}/6 details)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">{user?.email || "customer@nu3go.com"}</p>
            <p className="text-[11px] text-[#15803D] font-semibold flex items-center gap-1 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: Customer Portal Member
            </p>
          </div>
        </div>

        {/* Section 1: Personal & Contact Information */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#15803D]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-oswald text-base font-bold uppercase text-neutral-900 tracking-tight">
                Personal Information
              </h3>
              <p className="text-xs text-slate-500">Your name and direct contact phone for delivery coordination</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1.5">
              <label htmlFor="first_name" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>First Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="first_name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Kasun"
                  maxLength={100}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label htmlFor="last_name" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Last Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="last_name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Perera"
                  maxLength={100}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Email Address (Permanently Locked) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="email" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>Email Address (Account ID)</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  <Lock className="w-2.5 h-2.5 text-slate-500" />
                  <span>Locked</span>
                </span>
              </div>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  disabled
                  readOnly
                  tabIndex={-1}
                  value={user?.email || "customer@nu3go.com"}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-500 text-xs cursor-not-allowed font-medium select-none shadow-inner"
                  title="Email cannot be edited because it is tied to your account login."
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400">
                Email is permanently linked to your login credentials and cannot be edited.
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Phone Number</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="0771234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-400">Driver delivery notifications and SMS dispatch updates.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Delivery & Billing Address */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#15803D]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-oswald text-base font-bold uppercase text-neutral-900 tracking-tight">
                Delivery &amp; Billing Address
              </h3>
              <p className="text-xs text-slate-500">
                Primary morning drop-off location and billing destination for subscriptions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Street Address */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Street Address &amp; Suite / Apartment</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="address"
                  type="text"
                  required
                  placeholder="e.g., 123 Galle Rd, Apt 4B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={255}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>City / Region</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="city"
                  type="text"
                  required
                  placeholder="Colombo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={100}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#36D068] shrink-0 mt-0.5" />
            <span>
              This profile address is linked to your billing identity. Any active weekday subscription will automatically route chef deliveries to this destination.
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-[#0B3B17] hover:bg-[#124D20] text-white font-oswald font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0B3B17]/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#36D068]" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#36D068]" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

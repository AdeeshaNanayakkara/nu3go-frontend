"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { userService, UserProfile } from "@/services/api/user.service";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertCircle,
  Save,
} from "lucide-react";

export default function UserProfilePage() {
  const { user } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user?.email) {
      const parts = user.email.split("@")[0].split(".");
      setFirstName(parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "Nu3Go");
      setLastName(parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "Customer");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    try {
      if (user?.id) {
        await userService.updateProfile(user.id, {
          first_name: firstName,
          last_name: lastName,
          phone,
        });
      }
      setSuccessMsg("Profile details updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user?.email ? user.email.split("@")[0] : "Customer";

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl font-poppins">
      {/* Header */}
      <div>
        <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase text-neutral-900 tracking-tight leading-tight">
          Profile & Account Information
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
          Manage your personal details and contact information.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Card Header */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#36D068] to-emerald-400 flex items-center justify-center text-slate-950 font-oswald font-black text-2xl shadow-md shadow-[#36D068]/20 shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-oswald text-xl font-bold uppercase text-neutral-900 capitalize tracking-tight">
                {firstName} {lastName}
              </h2>
              <span className="font-oswald text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#15803D] border border-emerald-200">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-[11px] text-[#15803D] font-semibold flex items-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: Customer Portal Member
            </p>
          </div>
        </div>

        {/* Personal Details */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#15803D]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-oswald text-base font-bold uppercase text-neutral-900 tracking-tight">Personal Information</h3>
              <p className="text-xs text-slate-500">Your name and contact phone for delivery coordination</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address (Locked)</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || "customer@nu3go.com"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs cursor-not-allowed"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Phone Number (For Driver SMS/Call)</label>
              <input
                type="tel"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-neutral-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#36D068] focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>



        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#36D068] hover:bg-[#2eb85c] text-black font-oswald font-bold text-xs uppercase tracking-wider shadow-md shadow-[#36D068]/20 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Nu3go account password with your 6-digit OTP code.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white/45 backdrop-blur-xl rounded-[32px] border-[2.5px] border-[#36D068] shadow-2xl p-8 text-center text-slate-600 font-poppins">
          Loading reset form...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

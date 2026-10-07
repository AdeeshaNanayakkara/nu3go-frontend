import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/forms/verify-email-form";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address with the OTP code sent to your inbox.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white/45 backdrop-blur-xl rounded-[32px] border-[2.5px] border-[#36D068] p-10 text-center text-slate-600 font-poppins">
          Loading verification form...
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerLoginForm } from "@/components/forms/customer-login-form";

export const metadata: Metadata = {
  title: "Customer Sign In — Nu3Go",
  description: "Sign in to your Nu3Go customer account to access healthy meal subscriptions and deliveries.",
};

interface LoginPageProps {
  searchParams: Promise<{
    reason?: string;
    callbackUrl?: string;
    redirect?: string;
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { reason, callbackUrl, redirect, next } = await searchParams;

  const sessionExpiredMessage =
    reason === "session_expired"
      ? "Your session has expired. Please sign in again."
      : null;

  const resolvedCallback = callbackUrl || redirect || next || null;

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[920px] mx-auto min-h-[420px] bg-white rounded-3xl flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-[#0B3B17] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CustomerLoginForm
        sessionExpiredMessage={sessionExpiredMessage}
        initialCallbackUrl={resolvedCallback}
      />
    </Suspense>
  );
}

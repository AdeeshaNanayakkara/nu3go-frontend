import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/forms/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Portal Sign In — Nu3Go",
  description: "Secure administrator login for Nu3Go meal subscriptions and management.",
};

interface AdminLoginPageProps {
  searchParams: Promise<{ reason?: string; callbackUrl?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { reason } = await searchParams;

  const sessionExpiredMessage =
    reason === "session_expired"
      ? "Your administrator session has expired. Please authenticate again."
      : null;

  return <AdminLoginForm sessionExpiredMessage={sessionExpiredMessage} />;
}

import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Nu3go password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

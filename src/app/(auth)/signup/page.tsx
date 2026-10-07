import type { Metadata } from "next";
import { CustomerRegisterForm } from "@/components/forms/customer-register-form";

export const metadata: Metadata = {
  title: "Sign Up — Nu3Go",
  description: "Join Nu3Go and start your chef-crafted healthy meal subscription today.",
};

export default function SignupPage() {
  return <CustomerRegisterForm />;
}

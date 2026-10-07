import type { Metadata } from "next";
import { CustomerRegisterForm } from "@/components/forms/customer-register-form";

export const metadata: Metadata = {
  title: "Create Customer Account — Nu3Go",
  description: "Join Nu3Go and start your chef-crafted healthy meal subscription today.",
};

export default function RegisterPage() {
  return <CustomerRegisterForm />;
}

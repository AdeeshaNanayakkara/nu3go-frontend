import { redirect } from "next/navigation";

export default function SalesPaymentsRedirectPage() {
  redirect("/admin/sales?view=payments");
}


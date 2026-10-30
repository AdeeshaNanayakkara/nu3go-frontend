import { redirect } from "next/navigation";

export default function SalesBreakdownRedirectPage() {
  redirect("/admin/sales?view=breakdown");
}


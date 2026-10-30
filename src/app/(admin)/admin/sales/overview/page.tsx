import { redirect } from "next/navigation";

export default function SalesOverviewRedirectPage() {
  redirect("/admin/sales?view=overview");
}


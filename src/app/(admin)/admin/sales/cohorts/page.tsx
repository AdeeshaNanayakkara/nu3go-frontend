import { redirect } from "next/navigation";

export default function SalesCohortsRedirectPage() {
  redirect("/admin/sales?view=cohorts");
}


import { redirect } from "next/navigation";

export default function SalesRevenueRedirectPage() {
  redirect("/admin/sales?view=revenue");
}


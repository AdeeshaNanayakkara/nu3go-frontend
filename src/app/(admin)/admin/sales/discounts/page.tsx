import { redirect } from "next/navigation";

export default function SalesDiscountsRedirectPage() {
  redirect("/admin/sales?view=discounts");
}


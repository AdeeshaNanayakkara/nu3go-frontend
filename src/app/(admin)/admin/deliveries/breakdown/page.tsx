import { redirect } from "next/navigation";

export default function DeliveryBreakdownRedirectPage() {
  redirect("/admin/deliveries?view=breakdown");
}


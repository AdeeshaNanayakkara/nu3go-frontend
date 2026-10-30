import { redirect } from "next/navigation";

export default function DeliveryOverviewRedirectPage() {
  redirect("/admin/deliveries?view=overview");
}


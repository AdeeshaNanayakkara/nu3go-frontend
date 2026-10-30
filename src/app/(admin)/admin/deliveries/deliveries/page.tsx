import { redirect } from "next/navigation";

export default function DeliveriesTabRedirectPage() {
  redirect("/admin/deliveries?view=deliveries");
}


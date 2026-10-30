import { redirect } from "next/navigation";

export default function DeliveryTrendRedirectPage() {
  redirect("/admin/deliveries?view=trend");
}


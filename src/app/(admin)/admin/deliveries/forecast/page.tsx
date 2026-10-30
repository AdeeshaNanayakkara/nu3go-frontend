import { redirect } from "next/navigation";

export default function DeliveryForecastRedirectPage() {
  redirect("/admin/deliveries?view=forecast");
}


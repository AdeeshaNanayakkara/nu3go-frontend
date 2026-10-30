import { redirect } from "next/navigation";

export default function DeliveryOptionalMealsRedirectPage() {
  redirect("/admin/deliveries?view=optional-meals");
}


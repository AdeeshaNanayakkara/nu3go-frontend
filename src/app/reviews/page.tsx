import { redirect } from "next/navigation";

export default function ReviewsRedirectPage() {
  redirect("/admin/settings/reviews");
}

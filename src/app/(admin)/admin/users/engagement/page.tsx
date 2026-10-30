import { redirect } from "next/navigation";

export default function UsersEngagementRedirectPage() {
  redirect("/admin/users?view=engagement");
}

import { redirect } from "next/navigation";

export default function UsersSubscriptionsRedirectPage() {
  redirect("/admin/users?view=subscriptions");
}

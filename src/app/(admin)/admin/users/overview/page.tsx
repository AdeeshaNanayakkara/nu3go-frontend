import { redirect } from "next/navigation";

export default function UsersOverviewRedirectPage() {
  redirect("/admin/users?view=overview");
}

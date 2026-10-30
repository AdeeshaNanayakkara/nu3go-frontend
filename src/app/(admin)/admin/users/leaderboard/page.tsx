import { redirect } from "next/navigation";

export default function UsersLeaderboardRedirectPage() {
  redirect("/admin/users?view=leaderboard");
}

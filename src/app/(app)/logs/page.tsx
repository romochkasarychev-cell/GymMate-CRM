import { redirect } from "next/navigation";
import { LogsView } from "@/components/logs-view";
import { requireAdminUserFromCookies } from "@/lib/server/auth-user";

export default async function LogsPage() {
  try {
    await requireAdminUserFromCookies();
  } catch {
    redirect("/dashboard");
  }

  return <LogsView />;
}

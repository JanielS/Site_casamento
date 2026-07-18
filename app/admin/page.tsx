import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import { isAdminSessionValid, readAdminSession } from "@/lib/auth";
import { getWorkbookSnapshot } from "@/lib/excel";

export default async function AdminPage() {
  const session = await readAdminSession();

  if (!isAdminSessionValid(session)) {
    return <AdminLogin />;
  }

  const snapshot = await getWorkbookSnapshot();
  return <AdminDashboard initialData={snapshot} />;
}

import { requireAdminServer } from "@/lib/auth-server";

export default async function AdminDashboard() {
  const admin = await requireAdminServer();

  return <div>Welcome {typeof admin === 'string' ? admin : admin.email}</div>;

}

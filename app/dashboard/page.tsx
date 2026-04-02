import { requireAdminServer } from "@/lib/auth-server";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const admin = await requireAdminServer();

  return <DashboardClient />;
}

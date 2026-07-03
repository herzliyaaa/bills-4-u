import { requireAdminServer } from "@/lib/auth-server";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  await requireAdminServer();

  return <DashboardClient />;
}

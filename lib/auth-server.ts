import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "./jwt";

export async function requireAdminServer() {
  const cookiesList = await cookies();
  const token = cookiesList.get("auth_token")?.value;

  if (!token) redirect("/admin/login");

  try {
    return verifyToken(token);
  } catch {
    redirect("/admin/login");
  }
}

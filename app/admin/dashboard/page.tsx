import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    // redirect to login
    throw new Error("Unauthorized");
  }

  try {
    verifyToken(token);
  } catch {
    throw new Error("Invalid token");
  }

  return <div>Welcome to Admin Dashboard!</div>;
}

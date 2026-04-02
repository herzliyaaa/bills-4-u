import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import { parse } from "cookie";

export function requireAdminApi(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = parse(cookieHeader);
  const token = cookies["auth_token"];

  if (!token) throw new Error("Unauthorized");

  return verifyToken(token);
}
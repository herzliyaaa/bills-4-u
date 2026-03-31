import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import { parse } from "cookie";

export function requireAdmin(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = parse(cookieHeader);
  const token = cookies["auth_token"];

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payload = verifyToken(token);
    return payload; // { id, email }
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

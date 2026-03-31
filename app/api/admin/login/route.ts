import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { serialize } from "cookie";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const isValid = await verifyPassword(password, admin.password);
  if (!isValid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = signToken({ id: admin.id, email: admin.email });

  const cookie = serialize("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 4 * 60 * 60,
  });

  return NextResponse.json({ message: "Logged in" }, {
    status: 200,
    headers: { "Set-Cookie": cookie },
  });
}
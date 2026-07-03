import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { serialize } from "cookie";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const admin = await prisma.admin.create({
      data: { name, email, password: hashedPassword },
    });

    // Generate JWT token
    const token = signToken({ id: admin.id, email: admin.email });

    // Set token in HttpOnly cookie
    const cookie = serialize("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 4 * 60 * 60, // 4 hours
    });

    return NextResponse.json(
      { message: "Signup successful", adminId: admin.id },
      { headers: { "Set-Cookie": cookie } }
    );
  } catch (err) {
    console.error("Error during admin signup:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
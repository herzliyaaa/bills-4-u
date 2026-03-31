import { NextResponse } from "next/server";
import { serialize } from "cookie";

export function POST() {
  const cookie = serialize("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: -1,
  });

  return NextResponse.json({ message: "Logged out" }, {
    headers: { "Set-Cookie": cookie },
  });
}
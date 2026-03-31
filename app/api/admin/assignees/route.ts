import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authMiddleware";

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req as any);
  if (!(auth && typeof auth === "object")) return auth;

  const assignees = await prisma.assignee.findMany();
  return NextResponse.json(assignees);
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req as any);
  if (!(auth && typeof auth === "object")) return auth;

  const body = await req.json();
  const newAssignee = await prisma.assignee.create({ data: body });
  return NextResponse.json(newAssignee);
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req as any);
  if (!(auth && typeof auth === "object")) return auth;
  const { id } = await req.json();
  await prisma.assignee.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

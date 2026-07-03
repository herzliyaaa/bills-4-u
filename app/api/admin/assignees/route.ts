import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/lib/wrapper/withAdmin";

export const GET = withAdmin(async () => {
  const assignees = await prisma.assignee.findMany();
  return NextResponse.json(assignees);
});

export const POST = withAdmin(async (req) => {
  const body = await req.json();
  const newAssignee = await prisma.assignee.create({ data: body });
  return NextResponse.json(newAssignee);
});

export const DELETE = withAdmin(async (req) => {
  const { id } = await req.json();
  await prisma.assignee.delete({ where: { id } });
  return NextResponse.json({ success: true });
});

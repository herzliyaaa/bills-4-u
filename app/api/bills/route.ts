import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { billCreateSchema } from "@/lib/billSchema";

export const runtime = "nodejs";

const serialize = (b: any) => ({
  ...b,
  amount: Number(b.amount),
  dueDate: b.dueDate.toISOString(), // hook slices to YYYY-MM-DD
  paidAt: b.paidAt ? b.paidAt.toISOString() : null,
});

export async function GET() {
  try {
    const bills = await prisma.bill.findMany({ orderBy: { dueDate: "asc" } });
    return NextResponse.json(bills.map(serialize));
  } catch (error) {
    return NextResponse.json(error);
  }
}
export async function POST(req: Request) {
  const json = await req.json();
  const parsed = billCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Extra guard: disallow installment unless spaylater
  const installment =
    data.category === "spaylater" ? data.installment ?? null : null;

  const bill = await prisma.bill.create({
    data: {
      name: data.name,
      amount: data.amount,
      currency: "PHP",
      dueDate: new Date(data.dueDate + "T00:00:00"),
      status: "unpaid",
      category: data.category,
      installment,
      assignee: data.assignee ?? "none",
      provider: data.provider,
      notes: data.notes,
      source: data.category === "spaylater" ? "spaylater" : "manual",
    },
  });

  return NextResponse.json(serialize(bill), { status: 201 });
}

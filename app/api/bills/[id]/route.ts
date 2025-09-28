import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { billUpdateSchema } from "@/lib/billSchema";

export const runtime = "nodejs";

const toYMD = (d: Date | null | undefined) =>
  d ? d.toISOString().slice(0, 10) : null;

const serialize = (b: any) => ({
  ...b,
  amount: Number(b.amount),
  dueDate: toYMD(b.dueDate),
  paidAt: toYMD(b.paidAt),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const bill = await prisma.bill.findUnique({ where: { id: params.id } });
  if (!bill) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(bill));
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const json = await req.json();
  const parsed = billUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const patch: any = { ...parsed.data };
  if ("provider" in patch && patch.provider === "") patch.provider = null;
  if ("notes" in patch && patch.notes === "") patch.notes = null;
  if (patch.dueDate) patch.dueDate = new Date(`${patch.dueDate}T00:00:00`);
  if (patch.paidAt) patch.paidAt = new Date(`${patch.paidAt}T00:00:00`);

  if (patch.status === "paid" && !patch.paidAt) {
    const today = new Date();
    patch.paidAt = new Date(`${today.toISOString().slice(0, 10)}T00:00:00`);
  }

  if ("category" in patch) {
    if (patch.category !== "spaylater") {
      patch.installment = null;
    } else {
      if (!("installment" in patch) || patch.installment == null) {
        return NextResponse.json(
          {
            error: {
              formErrors: [],
              fieldErrors: {
                installment: [
                  'installment is required when category is "spaylater".',
                ],
              },
            },
          },
          { status: 400 }
        );
      }
    }
  } else if (
    "installment" in patch &&
    patch.installment &&
    patch.installment !== null
  ) {
    const existing = await prisma.bill.findUnique({
      where: { id: params.id },
      select: { category: true },
    });
    if (existing && existing.category !== "spaylater") {
      return NextResponse.json(
        {
          error: {
            formErrors: [],
            fieldErrors: {
              installment: [
                'installment must be omitted unless category is "spaylater".',
              ],
            },
          },
        },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.bill.update({
    where: { id: params.id },
    data: patch,
  });

  return NextResponse.json(serialize(updated));
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.bill.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

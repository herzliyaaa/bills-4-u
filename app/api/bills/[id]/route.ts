import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { billUpdateSchema } from "@/lib/billSchema";

export const runtime = "nodejs";

const toYMD = (d: Date | null | undefined) =>
  d ? d.toISOString().slice(0, 10) : null;

const serialize = (b: Record<string, unknown>) => ({
  ...b,
  amount: Number(b.amount),
  dueDate: toYMD(b.dueDate as Date | null | undefined),
  paidAt: toYMD(b.paidAt as Date | null | undefined),
});

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const bill = await prisma.bill.findUnique({ where: { id: params.id } });
  if (!bill) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(serialize(bill));
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const json = await req.json();
  const parsed = billUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const patch: Record<string, unknown> = { ...parsed.data };
  if ("provider" in patch && patch.provider === "") patch.provider = null;
  if ("notes" in patch && patch.notes === "") patch.notes = null;
  if (patch.dueDate) patch.dueDate = new Date(`${String(patch.dueDate)}T00:00:00`);
  if (patch.paidAt) patch.paidAt = new Date(`${String(patch.paidAt)}T00:00:00`);

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
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    await prisma.bill.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

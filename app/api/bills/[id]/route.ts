import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { billUpdateSchema } from '@/lib/billSchema';

export const runtime = 'nodejs';

// GET /api/bills/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const bill = await prisma.bill.findUnique({ where: { id: params.id } });
  if (!bill) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(bill);
}

// PUT /api/bills/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const json = await req.json();
  const parsed = billUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const patch = parsed.data as any;

  if (patch.dueDate) {
    patch.dueDate = new Date(patch.dueDate + 'T00:00:00');
  }
  if (patch.paidAt) {
    patch.paidAt = new Date(patch.paidAt + 'T00:00:00');
  }
  if (patch.status === 'paid' && !patch.paidAt) {
    const today = new Date();
    patch.paidAt = new Date(today.toISOString().slice(0,10) + 'T00:00:00');
  }

  const updated = await prisma.bill.update({
    where: { id: params.id },
    data: patch,
  });

  return NextResponse.json(updated);
}

// DELETE /api/bills/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.bill.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

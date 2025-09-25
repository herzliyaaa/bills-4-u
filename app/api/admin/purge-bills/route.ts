import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // make sure you have a prisma client helper

function isAuthorized(req: Request) {
  const expected = process.env.ADMIN_PURGE_TOKEN;
  if (!expected) return false;
  const url = new URL(req.url);
  const provided =
    req.headers.get('x-admin-token') ?? url.searchParams.get('token');
  return provided === expected;
}

export async function DELETE(req: Request) {
  if (!isAuthorized(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // If you add more tables later, put their deleteMany calls in this transaction
    const [bills] = await prisma.$transaction([
      prisma.bill.deleteMany({}),
    ]);

    return NextResponse.json({
      ok: true,
      deleted: { bills: bills.count },
    });
  } catch (err) {
    console.error('[PURGE_BILLS_ERROR]', err);
    return new NextResponse('Failed to purge data', { status: 500 });
  }
}

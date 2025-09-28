'use client';
import useSWR from 'swr';
import type { BillDTO } from '@/lib/bills';

type RawBill = any;

// Accept both "YYYY-MM-DD" and full ISO strings
const toDate = (s: string) => (s?.includes('T') ? new Date(s) : new Date(`${s}T00:00:00`));

const normalize = (b: RawBill): BillDTO => ({
  id: String(b.id),
  name: b.name,
  provider: b.provider ?? null,
  source: b.source ?? null,
  amount: Number(b.amount),                       // Decimal -> number
  currency: b.currency ?? 'PHP',
  dueDate: String(b.dueDate ?? '').slice(0, 10),  // -> "YYYY-MM-DD"
  status: b.status,
  paidAt: b.paidAt ? String(b.paidAt).slice(0, 10) : null,
  notes: b.notes ?? null,
  category: b.category,
  assignee: b.assignee,
  installment: b.installment ?? null,   
  createdAt: b.createdAt ?? new Date().toISOString(),
  updatedAt: b.updatedAt ?? new Date().toISOString(),
});

const fetcher = async (url: string): Promise<BillDTO[]> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Request failed');
  const json = await r.json();
  const arr: RawBill[] = Array.isArray(json) ? json : json?.bills ?? [];
  return arr.map(normalize);
};

export function useBills() {
  const { data, error, isLoading, mutate } = useSWR<BillDTO[]>('/api/bills', fetcher);

  const bills = data ?? [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const unpaid = bills.filter(b => b.status === 'unpaid');
  const overdue = unpaid.filter(b => toDate(b.dueDate) < startOfToday);
  const unpaidThisMonth = unpaid.filter(b => {
    const d = toDate(b.dueDate);
    return d >= startOfToday && d < startOfNextMonth;
  });
  const unpaidUpcoming = unpaid.filter(b => toDate(b.dueDate) >= startOfNextMonth);
  const paid = bills.filter(b => b.status === 'paid');

  async function addBill(input: Partial<BillDTO>) {
    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Add failed');
    await mutate();
  }
  async function updateBill(id: string, patch: Partial<BillDTO>) {
    const res = await fetch(`/api/bills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Update failed');
    await mutate();
  }
  async function removeBill(id: string) {
    const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    await mutate();
  }

  return {
    bills,
    unpaidThisMonth,
    unpaidUpcoming,
    overdue,
    paid,
    isLoading,
    isError: Boolean(error),
    addBill,
    updateBill,
    removeBill,
  };
}

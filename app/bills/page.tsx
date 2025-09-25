// app/page.tsx
'use client';

import Link from 'next/link';
import AddBillForm from '@/components/AddBillForm';
import { useBills } from '@/lib/useBills';

function formatMoney(amount: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
}
function SummaryCard({title, value, sub}:{title:string; value:string; sub?:string}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

export default function HomePage() {
  const { unpaidThisMonth, unpaidUpcoming, overdue, paid } = useBills();

  const totalThisMonth = unpaidThisMonth.reduce((s,b)=>s+b.amount,0);
  const totalUpcoming  = unpaidUpcoming.reduce((s,b)=>s+b.amount,0);
  const totalOverdue   = overdue.reduce((s,b)=>s+b.amount,0);
  const paidThisMonth  = paid
    .filter(b => b.paidAt && new Date(b.paidAt).getMonth() === new Date().getMonth())
    .reduce((s,b)=>s+b.amount,0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back 👋</h1>
          <p className="mt-1 text-sm text-gray-600">Add new bills below.</p>
        </div>

        <div className="flex gap-2">
          <Link href="/" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700">Go to Bills</Link>
          <Link href="/?tab=paid" className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">See Paid</Link>
        </div>
      </header>

      <section className="mb-8">
        <AddBillForm />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <SummaryCard title="Due This Month" value={formatMoney(totalThisMonth)} sub={`${unpaidThisMonth.length} bill(s)`}/>
        <SummaryCard title="Upcoming"       value={formatMoney(totalUpcoming)}  sub={`${unpaidUpcoming.length} bill(s)`}/>
        <SummaryCard title="Overdue"        value={formatMoney(totalOverdue)}   sub={`${overdue.length} bill(s)`}/>
        <SummaryCard title="Paid This Month" value={formatMoney(paidThisMonth)} />
      </section>
    </main>
  );
}

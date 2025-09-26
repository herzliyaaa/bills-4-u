// app/bills/page.tsx (or wherever this lives)
"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBills } from "@/lib/useBills";
import type { BillDTO as Bill } from "@/lib/bills";

/** =========================
 * Utilities
 * ======================= */

// Work with local dates (Manila is UTC+8). Parse yyyy-mm-dd as local midnight.
const toLocalDate = (isoDate: string) => new Date(`${isoDate}T00:00:00`);

function formatMoney(amount: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string) {
  const d = toLocalDate(iso);
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    weekday: "short",
  }).format(d);
}

function byDueDateAsc(a: Bill, b: Bill) {
  return toLocalDate(a.dueDate).getTime() - toLocalDate(b.dueDate).getTime();
}

function byPaidAtDesc(a: Bill, b: Bill) {
  const ta = a.paidAt ? toLocalDate(a.paidAt).getTime() : 0;
  const tb = b.paidAt ? toLocalDate(b.paidAt).getTime() : 0;
  return tb - ta;
}

function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
function startOfNextMonth() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth() + 1, 1);
}

/** =========================
 * UI bits
 * ======================= */

function TabSwitcher({
  active,
  onChange,
}: {
  active: "unpaid" | "paid";
  onChange: (tab: "unpaid" | "paid") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
      {(["unpaid", "paid"] as const).map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={[
              "px-4 py-2 text-sm font-medium rounded-md transition",
              isActive
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:bg-gray-100",
            ].join(" ")}
            aria-pressed={isActive}
          >
            {tab === "unpaid" ? "Unpaid" : "Paid"}
          </button>
        );
      })}
    </div>
  );
}

function Pill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "green" | "red" | "amber" | "indigo" | "orange";
}) {
  const styles: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-800",
    indigo: "bg-indigo-100 text-indigo-700",
    orange: "bg-orange-100 text-orange-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function BillRow({ bill }: { bill: Bill }) {
  const due = toLocalDate(bill.dueDate);
  const overdue = bill.status === "unpaid" && due < startOfToday();
  return (
    <div className="grid grid-cols-1 gap-2 rounded-lg border bg-white p-4 shadow-sm sm:grid-cols-12 sm:items-center">
      <div className="sm:col-span-5">
        <div className="flex items-center gap-2">
          <div className="text-base font-semibold text-gray-900">
            {bill.name}
          </div>
          {bill.category === "spaylater" && (
            <Pill tone="orange">SPayLater</Pill>
          )}
          {bill.category === "electricity" && (
            <Pill tone="indigo">SPayLater</Pill>
          )}
          {bill.category === "water" && <Pill tone="amber">SPayLater</Pill>}
        </div>
        {bill.provider && (
          <div className="text-sm text-gray-500">{bill.provider}</div>
        )}
        {bill.notes && (
          <div className="mt-1 text-xs text-gray-500">{bill.notes}</div>
        )}
      </div>

      <div className="sm:col-span-3">
        <div className="text-sm text-gray-500">Due</div>
        <div
          className={`font-medium ${
            overdue ? "text-red-600" : "text-gray-900"
          }`}
        >
          {formatDate(bill.dueDate)}
        </div>
        {overdue && (
          <div className="mt-1">
            <Pill tone="red">Overdue</Pill>
          </div>
        )}
      </div>

      <div className="sm:col-span-2">
        <div className="text-sm text-gray-500">Amount</div>
        <div className="font-semibold">
          {formatMoney(bill.amount, bill.currency ?? "PHP")}
        </div>
      </div>

      <div className="sm:col-span-2">
        {bill.status === "paid" ? (
          <>
            <div className="text-sm text-gray-500">Paid at</div>
            <div className="font-medium text-gray-900">
              {bill.paidAt ? formatDate(bill.paidAt) : "—"}
            </div>
            <div className="mt-2">
              <Pill tone="green">Paid</Pill>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-500">Status</div>
            <div className="mt-1">
              <Pill tone="amber">Unpaid</Pill>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  emptyText,
  bills,
}: {
  title: string;
  subtitle?: string;
  emptyText?: string;
  bills: Bill[];
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {bills.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
          {emptyText ?? "Nothing here."}
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((b) => (
            <BillRow key={b.id} bill={b} />
          ))}
        </div>
      )}
    </section>
  );
}

function AssigneeFilter({
  value,
  onChange,
}: {
  value: "all" | "lia" | "mary" | "none";
  onChange: (v: "all" | "lia" | "mary" | "none") => void;
}) {
  const OPTIONS = [
    { key: "all", label: "All" },
    { key: "lia", label: "Lia" },
    { key: "mary", label: "Mary" },
    { key: "none", label: "Unassigned" },
  ] as const;

  return (
    <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
      {OPTIONS.map((opt) => {
        const isActive = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={[
              "px-3 py-1.5 text-sm font-medium rounded-md transition",
              isActive
                ? "bg-slate-900 text-white shadow"
                : "text-gray-700 hover:bg-gray-100",
            ].join(" ")}
            aria-pressed={isActive}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** =========================
 * Page
 * ======================= */

export default function BillsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"unpaid" | "paid">("unpaid");
  const [assignee, setAssignee] = useState<"all" | "lia" | "mary" | "none">(
    "all"
  );
  const {
    bills,
    unpaidThisMonth,
    unpaidUpcoming,
    overdue,
    paid,
    isLoading,
    isError,
  } = useBills();

  const filterByAssignee = (list: Bill[]) =>
    assignee === "all" ? list : list.filter((b) => b.assignee === assignee);

  const unpaidThisMonthF = useMemo(
    () => filterByAssignee(unpaidThisMonth),
    [unpaidThisMonth, assignee]
  );
  const unpaidUpcomingF = useMemo(
    () => filterByAssignee(unpaidUpcoming),
    [unpaidUpcoming, assignee]
  );
  const overdueF = useMemo(
    () => filterByAssignee(overdue),
    [overdue, assignee]
  );
  const paidF = useMemo(() => filterByAssignee(paid), [paid, assignee]);

  const totalUnpaidThisMonth = unpaidThisMonthF.reduce(
    (sum, b) => sum + b.amount,
    0
  );
  const totalUnpaidUpcoming = unpaidUpcomingF.reduce(
    (sum, b) => sum + b.amount,
    0
  );

  const handleClick = () => router.push("/bills"); // adjust if this should open an "add" route

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-sm text-gray-500">Loading bills…</div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="text-sm text-red-600">
          Failed to load bills. Please refresh.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Bills
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your <span className="font-medium">Unpaid</span> and{" "}
            <span className="font-medium">Paid</span> bills. Better than
            spreadsheets, I guess.
          </p>
        </div>
        <div className="flex gap-2 justify-center items-center">
          <AssigneeFilter value={assignee} onChange={setAssignee} />
          <TabSwitcher active={tab} onChange={setTab} />
          <Button
            className="bg-indigo-600 hover:bg-indigo-500"
            onClick={handleClick}
          >
            <Plus />
          </Button>
        </div>
      </header>

      {/* Summary cards */}
      {tab === "unpaid" && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              This Month
            </div>
            <div className="mt-1 text-2xl font-bold">
              {formatMoney(totalUnpaidThisMonth)}
            </div>
            <div className="text-xs text-gray-500">
              {unpaidThisMonth.length} bill(s)
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Upcoming
            </div>
            <div className="mt-1 text-2xl font-bold">
              {formatMoney(totalUnpaidUpcoming)}
            </div>
            <div className="text-xs text-gray-500">
              {unpaidUpcoming.length} bill(s)
            </div>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Overdue
            </div>
            <div className="mt-1 text-2xl font-bold">
              {formatMoney(overdue.reduce((s, b) => s + b.amount, 0))}
            </div>
            <div className="text-xs text-gray-500">
              {overdue.length} bill(s)
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-8">
        {tab === "unpaid" ? (
          <>
            <Section
              title="This Month"
              subtitle="Bills due in the current month."
              emptyText="No bills due this month."
              bills={unpaidThisMonthF}
            />
            <Section
              title="Upcoming"
              subtitle="Bills due after this month."
              emptyText="No upcoming bills yet."
              bills={unpaidUpcomingF}
            />
            {overdue.length > 0 && (
              <Section
                title="Overdue"
                subtitle="Past-due bills that need attention."
                bills={overdueF}
              />
            )}
          </>
        ) : (
          <Section
            title="Paid"
            subtitle="Recently paid bills."
            emptyText="No paid bills yet."
            bills={paidF}
          />
        )}
      </div>
    </main>
  );
}

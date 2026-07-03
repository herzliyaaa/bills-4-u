"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRightLeft,
  CalendarDays,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type GuestTransaction = {
  id?: string;
  name?: string;
  amount?: number;
  installment?: string | null;
  assignee?: string;
  category?: string;
  bill_name?: string;
  bill_amount?: number;
  due_date?: string;
  transaction_range?: string;
  [key: string]: unknown;
};

type GuestSummaryResponse = {
  assignee: string;
  bill_name: string;
  bill_amount: number;
  transaction_total: number;
  remaining_balance: number;
  transactions: GuestTransaction[];
};

const SUMMARY_ENDPOINT =
  `${process.env.API_URL}/transactions/summary?assignee=herzlia&billName=Jun%25202026%2520Bill%2520Details`;

function formatMoney(amount: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function toMoney(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/[^0-9.-]/g, "");
  const amount = Number(normalized);
  return Number.isNaN(amount) ? 0 : amount;
}

function formatTitle(value: string | undefined) {
  if (!value) return "Unknown";
  return value.replace(/_/g, " ");
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-500">{note}</div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

export default function GuestOverviewClient() {
  const [summary, setSummary] = useState<GuestSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(SUMMARY_ENDPOINT);

        console.log("🚀 -----------------------------------------------------------------🚀");
        console.log("🚀 ~ GuestOverviewClient.tsx:129 ~ loadData ~ response:", response);
        console.log("🚀 -----------------------------------------------------------------🚀");


        if (!response.ok) {
          throw new Error("Failed to fetch guest summary");
        }

        const responseData = (await response.json()) as GuestSummaryResponse;

        if (!active) return;

        setSummary(responseData);
      } catch (fetchError) {
        if (!active) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load guest overview",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const billTotal = toMoney(summary?.bill_amount);
  const transactionTotal = toMoney(summary?.transaction_total);
  const remainingBalance = toMoney(summary?.remaining_balance);
  const transactions = summary?.transactions ?? [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-white/60 bg-white/70 px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.09)] backdrop-blur sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                Guest View
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Bills and transactions at a glance.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                This public page reads the guest summary endpoint and shows the
                bill summary, transaction total, remaining balance, and any
                detailed transactions returned by the API.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-slate-200 bg-white/80"
              >
                <Link href="/login" className="inline-flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  Back to login
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard
            label="Bill total"
            value={formatMoney(billTotal)}
            note={summary ? summary.bill_name : "Waiting for summary data"}
          />
          <StatCard
            label="Transactions total"
            value={formatMoney(transactionTotal)}
            note={`${transactions.length} transaction${transactions.length === 1 ? "" : "s"} in the summary feed`}
          />
          <StatCard
            label="Remaining balance"
            value={formatMoney(remainingBalance)}
            note="Bill amount minus transaction total"
          />
        </section>

        {loading ? (
          <div className="mt-6 rounded-[2rem] border border-white/60 bg-white/70 p-10 text-center shadow-[0_18px_60px_rgba(15,23,42,0.09)] backdrop-blur">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
            <p className="mt-4 text-sm text-slate-600">Loading guest data...</p>
          </div>
        ) : error ? (
          <div className="mt-6 rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.09)] backdrop-blur sm:p-6">
              <SectionHeader
                icon={<ReceiptText className="size-5" />}
                title="Bills"
                subtitle="Bill summary from the guest endpoint."
              />

              <div className="mt-5 space-y-3">
                {summary ? (
                  <article className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-950">
                            {decodeURIComponent(summary.bill_name)}
                          </h3>
                          <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                            {summary.assignee}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Assignee: {summary.assignee}
                        </p>
                        <p className="text-sm text-slate-600">
                          Transactions total: {formatMoney(transactionTotal)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Bill amount
                        </div>
                        <div className="mt-1 text-lg font-semibold text-slate-950">
                          {formatMoney(billTotal)}
                        </div>
                      </div>
                    </div>
                  </article>
                ) : (
                  <EmptyState text="No bill summary found." />
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.09)] backdrop-blur sm:p-6">
              <SectionHeader
                icon={<ArrowRightLeft className="size-5" />}
                title="Transactions"
                subtitle="Transactions returned by the guest summary endpoint."
              />

              <div className="mt-5 space-y-3">
                {transactions.length === 0 ? (
                  <EmptyState text="No transactions found." />
                ) : (
                  transactions.map((transaction, index) => (
                    <article
                      key={transaction.id ?? `${transaction.name ?? "transaction"}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-950">
                              {transaction.name ?? "Transaction"}
                            </h3>
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-900">
                              {formatTitle(transaction.category)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Assignee: {transaction.assignee ?? summary?.assignee ?? "guest"}
                          </p>
                          <p className="text-sm text-slate-600">
                            Transaction range: {transaction.transaction_range ? decodeURIComponent(transaction.transaction_range) : "—"}
                          </p>
                          <p className="text-sm text-slate-600">
                            Bill: {transaction.bill_name ? decodeURIComponent(transaction.bill_name) : decodeURIComponent(summary?.bill_name ?? "")}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Amount
                          </div>
                          <div className="mt-1 text-lg font-semibold text-slate-950">
                            {formatMoney(toMoney(transaction.amount))}
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            Bill amount: {formatMoney(toMoney(transaction.bill_amount ?? summary?.bill_amount))}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        <footer className="mt-6 flex flex-col gap-3 rounded-[2rem] border border-white/60 bg-white/60 px-5 py-4 text-sm text-slate-600 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Public guest overview powered by the summary API.</p>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            <span>Updated live on page load</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Bill = {
  id: string;
  billName: string;
  billAmount: number;
  totalAmount: number;
  itemCount: number;
  transactionTotal: number;
  transactionCount: number;
  transactionIds: string[];
  transactionRange: string;
  dueDate: string;
  status: string;
};

type Transaction = {
  id: string;
  name: string;
  amount: string;
  installment: string | null;
  category: string;
  billName: string;
  dueDate: string;
};

export default function Page() {
  const { payee } = useParams<{ payee: string }>();
  const searchParams = useSearchParams();
  const bill = searchParams.get("bill");

  const [bills, setBills] = useState<Bill[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const mode = bill ? "transactions" : "bills";

  useEffect(() => {
    async function load() {
      setLoading(true);

      if (!bill) {
        const response = await api.get<any>(
          `${process.env.NEXT_PUBLIC_API_URL}/bills?payeeName=${payee}`,
        );

        setBills(Array.isArray(response) ? response : []);
      } else {
        const response = await api.get<any>(
          `${process.env.NEXT_PUBLIC_API_URL}/transactions?payeeName=${payee}&billName=${encodeURIComponent(
            bill,
          )}`,
        );

        setTransactions(response.transactions);
        setBills([]);
      }

      setLoading(false);
    }

    load();
  }, [payee, bill]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || t.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [transactions, search, category]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => {
      const cleaned = t.amount.replace(/[^0-9.-]/g, "").trim();

      const value = parseFloat(cleaned || "0");

      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  }, [filteredTransactions]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-6 animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-28 rounded bg-gray-200" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ================= HEADER ================= */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 uppercase">
            {payee}
          </h1>

          <p className="text-sm text-gray-500">
            {bill ? `Viewing bill: ${bill}` : "Select a bill to continue"}
          </p>
        </div>

        {/* BACK BUTTON */}
        {/* BACK BUTTON */}
        <Link
          href={
            mode === "transactions" ? `/spaylater/transactions/${payee}` : "/"
          }
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← {mode === "transactions" ? "Back to Bills" : "Back to Home"}
        </Link>

        {/* ================= BILLS VIEW ================= */}
        {!bill && (
          <div className="grid gap-4 sm:grid-cols-2">
            {bills.map((b) => (
              <Link
                key={b.id}
                href={`/spaylater/transactions/${payee}?bill=${encodeURIComponent(
                  b.billName,
                )}`}
                className="group rounded-2xl border bg-white p-5 shadow-sm transition
                         hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* title */}
                <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {b.billName}
                </h2>

                {/* meta */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    {b.transactionCount} transactions
                  </div>

                  <div className="font-semibold text-gray-900">
                    ₱{b.transactionTotal?.toLocaleString()}
                  </div>
                </div>

                {/* footer */}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span>{b.status ?? "active"}</span>
                  <span className="group-hover:text-gray-600 transition">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ================= TRANSACTIONS VIEW ================= */}
        {bill && (
          <>
            <div className="rounded-2xl bg-white p-4 border shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  ₱
                  {totalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="text-xs text-gray-500 text-right">
                Based on {filteredTransactions.length} transaction
                {filteredTransactions.length !== 1 && "s"}
              </div>
            </div>

            {/* SEARCH + FILTER */}
            <div className="rounded-2xl bg-white p-4 border shadow-sm">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  className="flex-1 rounded-lg border px-4 py-2 outline-none
                           focus:ring-2 focus:ring-blue-500"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select
                  className="rounded-lg border px-4 py-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Installment">Installment</option>
                  <option value="BNPL">BNPL</option>
                </select>
              </div>

              <p className="mt-3 text-right text-sm text-gray-500">
                {filteredTransactions.length} transaction
                {filteredTransactions.length !== 1 && "s"}
              </p>
            </div>

            {/* TRANSACTION LIST */}
            <div className="space-y-3">
              {filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.name}</h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {t.dueDate.replace("Due Date ", "")}
                      </p>
                    </div>

                    {/* category badge */}
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        t.category === "Installment"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {t.category}
                    </span>
                  </div>

                  {/* bottom row */}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {t.installment ?? "-"}
                    </span>

                    <span
                      className={`font-semibold ${
                        t.amount.startsWith("-")
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {t.amount}
                    </span>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
                  No transactions found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

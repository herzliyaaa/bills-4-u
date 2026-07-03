"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Account = {
  name: string;
  billCount: number;
  totalAmount: number;
  color?: string;
};

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const response = await api.get<any>(`${process.env.NEXT_PUBLIC_API_URL}/payees`);

      const json = await response.json();

      setAccounts(Array.isArray(json) ? json : []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 animate-pulse">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Select an account to view bills and transactions
          </p>
        </div>

        {/* Account Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((a) => (
            <Link
              key={a.name}
              href={`spaylater/transactions/${encodeURIComponent(a.name)}`}
              className="group rounded-2xl border bg-white p-5 shadow-sm transition
                         hover:-translate-y-0.5 hover:shadow-md flex items-start gap-4"
            >
              {/* 🎨 COLOR INDICATOR */}
              <div
                className="h-12 w-1.5 rounded-full"
                style={{ backgroundColor: a.color || "#3B82F6" }}
              />

              {/* CONTENT */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {a.name}
                </h2>

                <div className="mt-3 flex items-center justify-between text-sm"></div>

                <div className="mt-3 text-xs text-gray-400 group-hover:text-gray-600">
                  View details →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* EMPTY STATE */}
        {accounts.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No accounts found
          </div>
        )}
      </div>
    </main>
  );
}

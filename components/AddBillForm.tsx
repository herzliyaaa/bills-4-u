"use client";

import { useState } from "react";
import {
  CATEGORIES,
  ASSIGNEES,
  INSTALLMENTS,
  type BillCategory,
  type BillAssignee,
  type Installment,
} from "@/lib/bills";
import { useBills } from "@/lib/useBills";

function formatMoneyInput(v: string) {
  return v.replace(/[^\d.]/g, "");
}

export default function AddBillForm() {
  const { addBill } = useBills();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [category, setCategory] = useState<BillCategory>("spaylater");
  const [assignee, setAssignee] = useState<BillAssignee>("none");
  const [installment, setInstallment] = useState<Installment>();
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amt = parseFloat(amount);
    if (!name.trim() || !dueDate || Number.isNaN(amt)) {
      alert("Please fill in Name, Amount, and Due Date.");
      return;
    }

    try {
      setSubmitting(true);
      await addBill({
        name: name.trim(),
        amount: amt,
        dueDate, // "yyyy-mm-dd" (API converts to Date)
        category,
        installment,
        assignee,
        provider: provider.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setName("");
      setAmount("");
      setDueDate("");
      setCategory("spaylater");
      setInstallment("bnpl");
      setAssignee("none");
      setProvider("");
      setNotes("");
    } catch (err) {
      console.error(err);
      alert("Failed to add bill. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClear() {
    setName("");
    setAmount("");
    setDueDate("");
    setCategory("spaylater");
    setAssignee("none");
    setInstallment("bnpl");
    setProvider("");
    setNotes("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border bg-white p-4 shadow-sm"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Add Bill
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-gray-700">Bill Name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="e.g. SPayLater – iPhone (3/6)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-700">
            Amount (PHP)
          </label>
          <input
            inputMode="decimal"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(formatMoneyInput(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-700">Due Date</label>
          <input
            type="date"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-700">Category</label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as BillCategory)}
          >
            {CATEGORIES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {category === "spaylater" && (
          <div>
            <label className="mb-1 block text-sm text-gray-700">
              Installment
            </label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={installment ?? ""}
              onChange={(e) => setInstallment(e.target.value as Installment)}
            >
              <option value="" disabled>
                Select plan
              </option>
              {INSTALLMENTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-gray-700">Assignee</label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value as BillAssignee)}
          >
            {ASSIGNEES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-700">
            Provider (optional)
          </label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Shopee, Meralco, Maynilad, PLDT…"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-700">
          Notes (optional)
        </label>
        <textarea
          className="w-full rounded-md border px-3 py-2 text-sm"
          rows={3}
          placeholder="Any details…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="reset"
          onClick={handleClear}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          disabled={submitting}
        >
          Clear
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Adding…" : "Add Bill"}
        </button>
      </div>
    </form>
  );
}

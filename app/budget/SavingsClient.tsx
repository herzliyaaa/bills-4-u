"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "../dashboard/DashboardClient";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
}
interface Transaction {
  id: string;
  type: "inflow" | "outflow";
  amount: number;
  category: Category;
  date: string;
  description?: string;
}
interface Budget {
  id: string;
  category: Category;
  amount: number;
  actualSpending: number;
  remaining: number;
  percentage: number;
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-6 rounded-lg border mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SavingsSection({
  savingsTarget,
  setSavingsTarget,
  savingsSaved,
  savingsProgress,
  savingsTransactions,
}: {
  savingsTarget: number;
  setSavingsTarget: (value: number) => void;
  savingsSaved: number;
  savingsProgress: number;
  savingsTransactions: Transaction[];
}) {
  return (
    <Section
      title="Savings Goal"
      subtitle="Dedicated savings progress for payroll repayment"
    >
      <div className="bg-white p-4 rounded-lg border mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
          <div>
            <p className="font-medium">Target</p>
            <p>{formatMoney(savingsTarget)}</p>
          </div>
          <div>
            <p className="font-medium">Saved so far</p>
            <p className="text-emerald-600 font-medium">
              {formatMoney(Math.abs(savingsSaved))}
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full bg-emerald-500"
            style={{ width: `${Math.min(savingsProgress, 100)}%` }}
          />
        </div>
        {/* //TODO: add button to set/update target amount */}
        {/* //TODO: change this to update the target budget amount instead of just setting a local state (need to decide if we want to allow multiple savings budgets or just one) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Savings Target
          </label>
          <input
            type="number"
            value={savingsTarget}
            onChange={(e) => setSavingsTarget(Number(e.target.value))}
            className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1000"
            min="0"
          />
        </div>
        {/* //TODO: add messaging when target is reached or if progress is very low (e.g. less than 25%) to encourage action */}
        <div className="flex justify-between text-xs text-gray-600">
          <span>{Math.min(savingsProgress, 100).toFixed(1)}% complete</span>
          <span>{savingsProgress >= 100 ? "Goal reached" : "Keep saving"}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border mb-4">
        <h3 className="font-medium text-gray-900 mb-2">Savings Transactions</h3>
        {savingsTransactions.length === 0 ? (
          <p className="text-gray-500">
            No savings transactions this period. Add one to track progress.
          </p>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {savingsTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium">
                    {tx.description || tx.category.name}
                  </p>
                  <p
                    className={`text-xs ${tx.type === "inflow" ? "text-green-600" : "text-red-600"}`}
                  >
                    {tx.type === "inflow" ? "Deposit" : "Withdrawal"}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${tx.type === "inflow" ? "text-green-600" : "text-red-600"}`}
                >
                  {tx.type === "inflow" ? "+" : "-"} {formatMoney(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 border-t pt-3">
        <p className="font-medium">How to use this savings tracker:</p>
        <ol className="list-decimal list-inside mt-1 space-y-1">
          <li>
            Create a budget named "Savings" with your payroll payback target.
          </li>
          <li>Log each payroll repayment as a transaction under "Savings".</li>
          <li>Revisit this page to monitor progress against the target.</li>
          <li>
            Once progress reaches 100%, you’ve completed the goal for the cycle.
          </li>
          <li>Update the target amount if your repayment plan changes.</li>
        </ol>
      </div>
    </Section>
  );
}

export default function SavingsClient() {
  const router = useRouter();
  const [showInitialInput, setShowInitialInput] = useState(false);
  const [initialAmount, setInitialAmount] = useState("");
  const [initialBalance, setInitialBalance] = useState(0);
  const [targetAmount, setTargetAmount] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsCategory, setSavingsCategory] = useState<Category | null>(null);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDescription, setTransactionDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<"inflow" | "outflow">(
    "inflow",
  );

  async function refreshData() {
    setLoading(true);
    try {
      const budgetsRes = await fetch("/api/budgets");
      if (!budgetsRes.ok) throw new Error("Failed to fetch budgets");
      const budgetsData = await budgetsRes.json();
      setBudgets(budgetsData);

      const transactionsRes = await fetch("/api/transactions?limit=200");
      if (!transactionsRes.ok) throw new Error("Failed to fetch transactions");
      const transactionsData = await transactionsRes.json();
      setTransactions(transactionsData.transactions || transactionsData);

      const categoriesRes = await fetch("/api/categories?type=expense");
      if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
      const categoriesData = await categoriesRes.json();
      setSavingsCategory(
        categoriesData.find((cat: Category) =>
          cat.name.toLowerCase().includes("savings"),
        ) || null,
      );

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const savingsTransactions = transactions
    .filter((t) => t.category.name.toLowerCase().includes("savings"))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const savingsBudgets = budgets.filter((b) =>
    b.category.name.toLowerCase().includes("savings"),
  );
  const savingsTarget = savingsBudgets.reduce((sum, b) => sum + b.amount, 0);
  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (transactions.length && savingsCategory) {
      const existingInitial = transactions.find(
        (t) =>
          t.category.name.toLowerCase().includes("savings") &&
          t.description?.toLowerCase().includes("initial"),
      );
      if (existingInitial) setInitialAmount(String(existingInitial.amount));
    }
  }, [transactions, savingsCategory]);

  // Calculate initial balance and total saved once transactions and savingsTransactions are loaded
  useEffect(() => {
    if (savingsTransactions.length > 0) {
      const initialTx = savingsTransactions.find((tx) =>
        tx.description?.toLowerCase().includes("initial"),
      );
      const initial = initialTx ? Number(initialTx.amount) : 0;
      setInitialBalance(initial);

      const inflow = savingsTransactions
        .filter(
          (t) =>
            t.type === "inflow" &&
            !t.description?.toLowerCase().includes("initial"),
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const outflow = savingsTransactions
        .filter((t) => t.type === "outflow")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setTotalSaved(initial + inflow - outflow); // use a new state for totalSaved
    }
  }, [savingsTransactions]);

  // Update targetAmount when savingsTarget changes
  useEffect(() => {
    setTargetAmount(savingsTarget);
  }, [savingsTarget]);

  const handleAddSavings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!savingsCategory)
      return setError(
        "No savings category found. Create a Savings expense category first.",
      );

    const amountNumeric = Number(transactionAmount);
    if (Number.isNaN(amountNumeric) || amountNumeric <= 0)
      return setError("Enter a valid positive amount.");

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: transactionType,
          amount: amountNumeric,
          currency: "PHP",
          categoryId: savingsCategory.id,
          date: transactionDate,
          description:
            transactionDescription ||
            (transactionType === "inflow"
              ? "Savings Deposit"
              : "Savings Withdrawal"),
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json())?.error || "Failed to create transaction.",
        );

      setSuccess("Savings transaction added successfully.");
      setTransactionAmount("");
      setTransactionDescription("");
      setTransactionDate(new Date().toISOString().slice(0, 10));

      await refreshData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save transaction.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveInitialBalance = async () => {
    const val = Number(initialAmount);
    if (!val || val < 0) return setError("Enter a valid starting amount.");
    if (!savingsCategory) return setError("Savings category not found.");

    // Find existing initial balance transaction
    const existingInitial = transactions.find(
      (t) =>
        t.category.name.toLowerCase().includes("savings") &&
        t.description?.toLowerCase().includes("initial"),
    );

    try {
      // Delete existing initial balance if it exists
      if (existingInitial) {
        await fetch(`/api/transactions/${existingInitial.id}`, {
          method: "DELETE",
        });
      }

      // Create a new initial balance transaction
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "inflow",
          amount: val,
          currency: "PHP",
          categoryId: savingsCategory.id,
          date: new Date().toISOString(),
          description: "Initial Savings Balance",
        }),
      });

      if (!res.ok) throw new Error("Failed to save initial balance");

      setShowInitialInput(false);
      setInitialAmount("");
      refreshData();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to save initial balance",
      );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600 text-center">Error: {error}</p>
      </div>
    );

  // Total money added to savings
  const savingsInflow = transactions
    .filter(
      (t) =>
        t.category.name.toLowerCase().includes("savings") &&
        t.type === "inflow",
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Total money withdrawn from savings
  const savingsOutflow = transactions
    .filter(
      (t) =>
        t.category.name.toLowerCase().includes("savings") &&
        t.type === "outflow",
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Net savings available
  const savingsSaved = savingsInflow - savingsOutflow;

  // Progress compared to your target budget
  const savingsProgress =
    savingsTarget > 0 ? (savingsSaved / savingsTarget) * 100 : 0;

  // Initial balance is a transaction with description "Initial Savings Balance"
  const initialTx = savingsTransactions.find((tx) =>
    tx.description?.toLowerCase().includes("initial"),
  );
  const initial = initialTx ? Number(initialTx.amount) : 0;
  // setInitialBalance(initial);

  // Calculate saved amount
  const inflow = savingsTransactions
    .filter(
      (t) =>
        t.type === "inflow" &&
        !t.description?.toLowerCase().includes("initial"),
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const outflow = savingsTransactions
    .filter((t) => t.type === "outflow")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // const totalSaved = initial + inflow - outflow;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Savings Tracker
            </h1>
            <p className="text-gray-600 mt-1">
              Track your payroll loan repayment savings separately from your
              general budget.
            </p>
          </div>
          <button
            onClick={() => router.push("/budget")}
            className="px-4 py-2 bg-white border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Back to Budget
          </button>
        </div>

        {/* Initial Balance Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 p-5 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Starting Balance</h3>
            {!showInitialInput && (
              <button
                onClick={() => setShowInitialInput(true)}
                className="text-sm px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Set Balance
              </button>
            )}
          </div>
          {!showInitialInput ? (
            <button
              onClick={() => setShowInitialInput(true)}
              className="text-sm px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              {initialAmount ? "Edit Balance" : "Set Balance"}
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter current savings"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={handleSaveInitialBalance}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Add Payroll Savings */}
        <Section
          title="Add Payroll Savings"
          subtitle="Record one payroll repayment transaction"
        >
          <form onSubmit={handleAddSavings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Amount
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000"
                  min="0"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Date</span>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Category
                </span>
                <input
                  type="text"
                  value={
                    savingsCategory
                      ? savingsCategory.name
                      : "Savings (not found)"
                  }
                  readOnly
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Type</span>
              <select
                value={transactionType}
                onChange={(e) =>
                  setTransactionType(e.target.value as "inflow" | "outflow")
                }
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="inflow">+ Add to Savings</option>
                <option value="outflow">- Withdraw from Savings</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">
                Description
              </span>
              <input
                type="text"
                value={transactionDescription}
                onChange={(e) => setTransactionDescription(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Payroll installment 1"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Add Savings Transaction"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/budget")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                View budget setup
              </button>
            </div>
          </form>
        </Section>

        <SavingsSection
          savingsTarget={targetAmount}
          setSavingsTarget={setTargetAmount}
          savingsSaved={totalSaved}
          savingsProgress={savingsProgress}
          savingsTransactions={savingsTransactions}
        />
      </div>
    </div>
  );
}

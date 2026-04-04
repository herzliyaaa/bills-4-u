"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, formatDate } from "../dashboard/DashboardClient";

// Types
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

// Navigation Component
function Navigation() {
  const router = useRouter();

  return (
    <nav className="bg-white border-b mb-6">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex space-x-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Bills Dashboard
          </button>
          <button
            onClick={() => router.push("/budget")}
            className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
          >
            Budget Tracker
          </button>
        </div>
      </div>
    </nav>
  );
}

// Utility functions
function Pill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "green" | "red" | "amber" | "indigo" | "orange";
}) {
  const colors = {
    slate: "bg-slate-100 text-slate-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
    indigo: "bg-indigo-100 text-indigo-800",
    orange: "bg-orange-100 text-orange-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[tone]}`}
    >
      {children}
    </span>
  );
}

function Section({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white p-6 rounded-lg border ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// Overview Cards Component
function BudgetOverviewCards({
  totalIncome,
  totalExpenses,
  netIncome,
  budgetUtilization,
}: {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  budgetUtilization: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border">
        <div className="text-sm text-gray-600">Total Income</div>
        <div className="text-2xl font-bold text-green-600">
          {formatMoney(totalIncome)}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="text-sm text-gray-600">Total Expenses</div>
        <div className="text-2xl font-bold text-red-600">
          {formatMoney(totalExpenses)}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="text-sm text-gray-600">Net Income</div>
        <div
          className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          {formatMoney(netIncome)}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="text-sm text-gray-600">Budget Used</div>
        <div className="text-2xl font-bold text-blue-600">
          {budgetUtilization.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

// Budget Progress Card Component
function BudgetProgressCard({ budget }: { budget: Budget }) {
  const progress = Math.min(budget.percentage, 100);
  const isOverBudget = budget.actualSpending > budget.amount;

  return (
    <div className="bg-white p-4 rounded-lg border mb-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{budget.category.name}</h3>
        <span
          className={`text-sm ${isOverBudget ? "text-red-600" : "text-green-600"}`}
        >
          {formatMoney(budget.remaining)} left
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${isOverBudget ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>{formatMoney(budget.actualSpending)} spent</span>
        <span>{formatMoney(budget.amount)} budgeted</span>
      </div>
    </div>
  );
}

// Transaction Timeline Component
function TransactionTimeline({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No transactions yet</p>
      ) : (
        transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === "inflow" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {transaction.type === "inflow" ? "↑" : "↓"}
            </div>

            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">
                    {transaction.description || transaction.category.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <span
                  className={`font-medium ${
                    transaction.type === "inflow"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "inflow" ? "+" : "-"}
                  {formatMoney(transaction.amount)}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Category Breakdown Component
function SavingsSection({
  savingsTarget,
  savingsSaved,
  savingsProgress,
  savingsTransactions,
  savingsInflow,
  savingsOutflow,
}: {
  savingsTarget: number;
  savingsSaved: number;
  savingsProgress: number;
  savingsTransactions: Transaction[];
  savingsInflow: number;
  savingsOutflow: number;
}) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"inflow" | "outflow">("inflow");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      setSubmitMessage({ type: "error", text: "Please enter a valid amount" });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage(null);

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          categoryId: "savings", // Will be resolved by API
          amount: numAmount,
          date: new Date().toISOString(),
          description:
            description ||
            (type === "inflow" ? "Savings Deposit" : "Savings Withdrawal"),
        }),
      });

      if (!response.ok) throw new Error("Failed to add transaction");

      setSubmitMessage({
        type: "success",
        text: "Transaction added successfully!",
      });
      setAmount("");
      setDescription("");
      setType("inflow");

      // Refresh data
      window.location.reload();
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to add transaction",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section
      title="Savings Tracker"
      subtitle="Your payroll repayment savings goal"
    >
      {savingsTarget === 0 ? (
        <p className="text-gray-500">
          No savings budget yet. Create a "Savings" budget to track
          payroll-based repayments.
        </p>
      ) : (
        <>
          {/* Progress Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-200 mb-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Inflow
                </p>
                <p className="text-lg font-bold text-green-600">
                  {formatMoney(savingsInflow)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Outflow
                </p>
                <p className="text-lg font-bold text-red-600">
                  {formatMoney(savingsOutflow)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">
                  Balance
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {formatMoney(savingsSaved)}
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-300 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                style={{ width: `${Math.min(savingsProgress, 100)}%` }}
              />
            </div>

            <p className="text-sm text-emerald-700 font-medium mt-3">
              {savingsProgress >= 100
                ? "🎉 Goal reached! Consider resetting for next cycle."
                : `${formatMoney(savingsTarget - savingsSaved)} remaining`}
            </p>
          </div>

          {/* Add Transaction Form */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <h3 className="font-medium text-gray-900 mb-3">
              Add Savings Movement
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as "inflow" | "outflow")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="inflow">+ Inflow (Money In)</option>
                    <option value="outflow">- Outflow (Money Out)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Payroll deposit, Repayment"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {submitMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    submitMessage.type === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {submitMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !amount}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Adding..." : "Add Transaction"}
              </button>
            </form>
          </div>

          {/* Transactions List */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-medium text-gray-900 mb-3">
              Recent Savings Movements
            </h3>
            {savingsTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No savings movements recorded yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savingsTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {tx.description || tx.category.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        tx.type === "inflow" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {/* {tx.type === "inflow" ? "+" : "-"}
                      {formatMoney(tx.amount)} */}
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Icon */}
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full ${
                              tx.type === "inflow"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {tx.type === "inflow" ? "↑" : "↓"}
                          </div>

                          {/* Info */}
                          <div>
                            <p className="font-medium text-sm">
                              {tx.description || tx.category.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(tx.date)}
                            </p>

                            {/* 👇 THIS is the missing label */}
                            <p
                              className={`text-xs font-medium ${
                                tx.type === "inflow"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {tx.type === "inflow"
                                ? "Inflow (Deposit)"
                                : "Outflow (Withdrawal)"}
                            </p>
                          </div>
                        </div>

                        {/* Amount */}
                        <span
                          className={`font-bold text-sm ${
                            tx.type === "inflow"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {tx.type === "inflow" ? "+" : "-"}
                          {formatMoney(tx.amount)}
                        </span>
                      </div>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-4 text-xs text-gray-500 border-t pt-3">
        <strong>How to use:</strong>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Set a "Savings" budget in the Budget Progress section below.</li>
          <li>
            Use the form above to log inflows (deposits) and outflows
            (withdrawals).
          </li>
          <li>Track progress toward your payroll repayment goal.</li>
          <li>When progress reaches 100%, your goal is complete!</li>
        </ol>
      </div>
    </Section>
  );
}

// Quick Actions Component
function QuickActions() {
  const router = useRouter();

  return (
    <div className="bg-white p-4 rounded-lg border mb-6">
      <h3 className="font-medium mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <span>+</span>
          <span>Add Income</span>
        </button>

        <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <span>+</span>
          <span>Add Expense</span>
        </button>

        <button
          className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => router.push("/budget/savings")}
        >
          <span>💰</span>
          <span>Savings Tracker</span>
        </button>

        <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <span>📊</span>
          <span>View Reports</span>
        </button>
      </div>
    </div>
  );
}

// Main Budget Client Component
export default function BudgetClient() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryData, setCategoryData] = useState<
    { category: string; amount: number; color: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeTransaction = (transaction: any): Transaction => ({
    id: String(transaction.id),
    type: transaction.type,
    amount: Number(transaction.amount) || 0,
    category: transaction.category,
    date: String(transaction.date),
    description: transaction.description ?? undefined,
  });

  const normalizeBudget = (budget: any): Budget => ({
    id: String(budget.id),
    category: budget.category,
    amount: Number(budget.amount) || 0,
    actualSpending: Number(budget.actualSpending) || 0,
    remaining: Number(budget.remaining) || 0,
    percentage: Number(budget.percentage) || 0,
  });

  // Calculate overview metrics
  const totalIncome = transactions
    .filter((t) => t.type === "inflow")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "outflow")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netIncome = totalIncome - totalExpenses;

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.actualSpending, 0);
  const budgetUtilization =
    totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  // Savings goal (use budget category named "Savings")
  const savingsBudgets = budgets.filter((b) =>
    b.category.name.toLowerCase().includes("savings"),
  );
  const savingsTarget = savingsBudgets.reduce((sum, b) => sum + b.amount, 0);
  const savingsInflow = transactions
    .filter(
      (t) =>
        t.category.name.toLowerCase().includes("savings") &&
        t.type === "inflow",
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsOutflow = transactions
    .filter(
      (t) =>
        t.category.name.toLowerCase().includes("savings") &&
        t.type === "outflow",
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const savingsTransactions = transactions.filter((t) =>
    t.category.name.toLowerCase().includes("savings"),
  );
  const savingsSaved = savingsInflow - savingsOutflow;
  const savingsProgress =
    savingsTarget > 0 ? (savingsSaved / savingsTarget) * 100 : 0;
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch budgets
        const budgetsRes = await fetch("/api/budgets");
        if (!budgetsRes.ok) throw new Error("Failed to fetch budgets");
        const budgetsData = await budgetsRes.json();
        setBudgets(budgetsData);

        // Fetch recent transactions
        const transactionsRes = await fetch("/api/transactions?limit=20");
        if (!transactionsRes.ok)
          throw new Error("Failed to fetch transactions");
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || transactionsData);

        // Calculate category breakdown
        const categoryMap = new Map<
          string,
          { amount: number; color: string }
        >();
        (transactionsData.transactions || transactionsData)
          .filter((t: Transaction) => t.type === "outflow")
          .forEach((t: Transaction) => {
            const existing = categoryMap.get(t.category.name) || {
              amount: 0,
              color: t.category.color || "#3B82F6",
            };
            categoryMap.set(t.category.name, {
              amount: existing.amount + t.amount,
              color: existing.color,
            });
          });

        const categoryBreakdown = Array.from(categoryMap.entries())
          .map(([category, data]) => ({ category, ...data }))
          .sort((a, b) => b.amount - a.amount);

        setCategoryData(categoryBreakdown);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading budget data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
          <p className="text-gray-600 mt-2">
            Monitor your income, expenses, and budget progress
          </p>
        </div>

        {/* Overview Cards */}
        <BudgetOverviewCards
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netIncome={netIncome}
          budgetUtilization={budgetUtilization}
        />

        <SavingsSection
          savingsTarget={savingsTarget}
          savingsSaved={savingsSaved}
          savingsProgress={savingsProgress}
          savingsTransactions={savingsTransactions}
          savingsInflow={savingsInflow}
          savingsOutflow={savingsOutflow}
        />

        {/* Quick Actions */}
        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Budget Progress */}
          <div className="lg:col-span-1">
            <Section
              title="Budget Progress"
              subtitle="This month's spending vs budget"
            >
              {budgets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No budgets set up yet
                </p>
              ) : (
                <div className="space-y-3">
                  {budgets.map((budget) => (
                    <BudgetProgressCard key={budget.id} budget={budget} />
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* Right Column - Charts and Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Section title="Recent Transactions">
              <TransactionTimeline transactions={transactions} />
            </Section>

            {/* <Section title="Spending by Category">
              <CategoryBreakdown data={categoryData} />
            </Section> */}
          </div>
        </div>
      </div>
    </div>
  );
}

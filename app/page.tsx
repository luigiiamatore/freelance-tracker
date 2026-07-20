import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatsCards from "@/components/StatsCards";
import IncomeTrendChart from "@/components/charts/IncomeTrendChart";
import ExpenseCategoryChart from "@/components/charts/ExpenseCategoryChart";
import { EXPENSE_CATEGORIES, type Expense, type Income } from "@/lib/types";

function lastSixMonths() {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return months;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: incomeData }, { data: expenseData }] = await Promise.all([
    supabase.from("income").select("*"),
    supabase.from("expenses").select("*"),
  ]);

  const income = (incomeData ?? []) as Income[];
  const expenses = (expenseData ?? []) as Expense[];

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const months = lastSixMonths();
  const incomeTrend = months.map(({ key, label }) => ({
    month: label,
    total: income
      .filter((item) => item.date.startsWith(key))
      .reduce((sum, item) => sum + item.amount, 0),
  }));

  const expenseByCategory = EXPENSE_CATEGORIES.map((category) => ({
    category,
    total: expenses
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.amount, 0),
  }));

  const hasData = income.length > 0 || expenses.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          An overview of your freelance income and expenses.
        </p>
      </div>

      <StatsCards totalIncome={totalIncome} totalExpenses={totalExpenses} netProfit={netProfit} />

      {hasData ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <IncomeTrendChart data={incomeTrend} />
          <ExpenseCategoryChart data={expenseByCategory} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No data yet. Start by adding an{" "}
            <Link href="/income" className="text-indigo-600 hover:underline dark:text-indigo-400">
              invoice
            </Link>{" "}
            or an{" "}
            <Link href="/expenses" className="text-indigo-600 hover:underline dark:text-indigo-400">
              expense
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

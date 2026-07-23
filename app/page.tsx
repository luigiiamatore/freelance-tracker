import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatsCards from "@/components/StatsCards";
import PeriodFilter from "@/components/PeriodFilter";
import IncomeTrendChart from "@/components/charts/IncomeTrendChart";
import ExpenseCategoryChart from "@/components/charts/ExpenseCategoryChart";
import { EXPENSE_CATEGORIES, type Expense, type Income } from "@/lib/types";
import {
  buildTrendBuckets,
  dateRangeForFilter,
  describeFilter,
  filterByRange,
  getAvailablePeriods,
  parsePeriodFilter,
} from "@/lib/period";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();

  const [{ data: incomeData }, { data: expenseData }] = await Promise.all([
    supabase.from("income").select("*"),
    supabase.from("expenses").select("*"),
  ]);

  const allIncome = (incomeData ?? []) as Income[];
  const allExpenses = (expenseData ?? []) as Expense[];

  const filter = parsePeriodFilter(await searchParams);
  const range = dateRangeForFilter(filter);
  const income = filterByRange(allIncome, range);
  const expenses = filterByRange(allExpenses, range);

  const allDates = [...allIncome, ...allExpenses].map((item) => item.date);
  const availablePeriods = {
    month: getAvailablePeriods(allDates, "month"),
    quarter: getAvailablePeriods(allDates, "quarter"),
    year: getAvailablePeriods(allDates, "year"),
  };

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const buckets = buildTrendBuckets(filter);
  const incomeTrend = buckets.map(({ key, label }) => ({
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
  const hasAnyData = allIncome.length > 0 || allExpenses.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            An overview of your freelance income and expenses.
          </p>
        </div>
        <PeriodFilter
          granularity={filter.granularity}
          value={filter.value}
          availablePeriods={availablePeriods}
        />
      </div>

      <StatsCards totalIncome={totalIncome} totalExpenses={totalExpenses} netProfit={netProfit} />

      {hasData ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <IncomeTrendChart data={incomeTrend} title={`Income trend — ${describeFilter(filter)}`} />
          <ExpenseCategoryChart
            data={expenseByCategory}
            title={filter.granularity === "all" ? undefined : `Expenses by category — ${describeFilter(filter)}`}
          />
        </div>
      ) : hasAnyData ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No income or expenses in this period.
          </p>
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

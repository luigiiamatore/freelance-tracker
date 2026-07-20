import { createClient } from "@/lib/supabase/server";
import TaxCalculator from "@/components/TaxCalculator";
import type { Expense, Income } from "@/lib/types";

export default async function CalculatorPage() {
  const supabase = await createClient();

  const [{ data: incomeData }, { data: expenseData }] = await Promise.all([
    supabase.from("income").select("amount"),
    supabase.from("expenses").select("amount"),
  ]);

  const totalIncome = ((incomeData ?? []) as Pick<Income, "amount">[]).reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalExpenses = ((expenseData ?? []) as Pick<Expense, "amount">[]).reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Tax calculator</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Estimate Italian freelance taxes on your net profit.
        </p>
      </div>
      <TaxCalculator defaultIncome={totalIncome} defaultExpenses={totalExpenses} />
    </div>
  );
}

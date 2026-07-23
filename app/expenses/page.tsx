import { createClient } from "@/lib/supabase/server";
import { getAttachmentsByParent } from "@/lib/attachments";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import type { Expense } from "@/lib/types";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  const expenses = (data ?? []) as Expense[];
  const attachmentsByExpenseId = await getAttachmentsByParent({
    supabase,
    column: "expense_id",
    parentIds: expenses.map((item) => item.id),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Expenses</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Track business expenses by category.
        </p>
      </div>
      <ExpenseForm />
      <ExpenseList expenses={expenses} attachmentsByExpenseId={attachmentsByExpenseId} />
    </div>
  );
}

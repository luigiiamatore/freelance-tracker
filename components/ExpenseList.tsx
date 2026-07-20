import { deleteExpense } from "@/app/actions/expenses";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense, ExpenseCategory } from "@/lib/types";

const CATEGORY_STYLES: Record<ExpenseCategory, string> = {
  Software: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  Travel: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  Office: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Other: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function ExpenseList({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No expenses yet. Add your first one above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Description</th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Date</th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Category</th>
            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Amount</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
          {expenses.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.description}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                {formatDate(item.date)}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${CATEGORY_STYLES[item.category]}`}>
                  {item.category}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {formatCurrency(item.amount)}
              </td>
              <td className="px-4 py-3 text-right">
                <form action={deleteExpense}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="text-sm text-zinc-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                    aria-label={`Delete expense ${item.description}`}
                  >
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

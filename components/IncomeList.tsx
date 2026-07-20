import { deleteIncome } from "@/app/actions/income";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Income, IncomeStatus } from "@/lib/types";

const STATUS_STYLES: Record<IncomeStatus, string> = {
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default function IncomeList({ income }: { income: Income[] }) {
  if (income.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No invoices yet. Add your first one above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Client</th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Date</th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Status</th>
            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Amount</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
          {income.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                <div className="font-medium">{item.client}</div>
                {item.invoice_id && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">#{item.invoice_id}</div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                {formatDate(item.date)}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${STATUS_STYLES[item.status]}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {formatCurrency(item.amount)}
              </td>
              <td className="px-4 py-3 text-right">
                <form action={deleteIncome}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="text-sm text-zinc-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
                    aria-label={`Delete invoice for ${item.client}`}
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

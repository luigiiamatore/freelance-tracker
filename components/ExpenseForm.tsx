"use client";

import { useActionState, useRef, useEffect } from "react";
import { addExpense, type ExpenseFormState } from "@/app/actions/expenses";
import { EXPENSE_CATEGORIES } from "@/lib/types";

const inputClass =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-50";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function ExpenseForm() {
  const [state, formAction, pending] = useActionState<ExpenseFormState, FormData>(
    addExpense,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state?.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="col-span-full text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Add expense
      </h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className={labelClass}>Description</label>
        <input id="description" name="description" required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className={labelClass}>Category</label>
        <select id="category" name="category" defaultValue="Software" className={inputClass}>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className={labelClass}>Amount (€)</label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0"
          step="0.01"
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date" className={labelClass}>Date</label>
        <input id="date" name="date" type="date" required className={inputClass} />
      </div>

      {state?.error && (
        <p className="col-span-full text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="col-span-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60 sm:w-fit"
      >
        {pending ? "Saving…" : "Add expense"}
      </button>
    </form>
  );
}

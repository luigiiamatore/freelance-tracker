"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";

const IRPEF_RATE = 0.23;
const IRAP_RATE = 0.035;
const SS_RATE = 0.15;

const inputClass =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-50";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export default function TaxCalculator({
  defaultIncome,
  defaultExpenses,
}: {
  defaultIncome: number;
  defaultExpenses: number;
}) {
  const [income, setIncome] = useState(defaultIncome.toFixed(2));
  const [expenses, setExpenses] = useState(defaultExpenses.toFixed(2));

  const result = useMemo(() => {
    const incomeNum = Math.max(0, Number(income) || 0);
    const expensesNum = Math.max(0, Number(expenses) || 0);
    const netProfit = Math.max(0, incomeNum - expensesNum);

    const irpef = netProfit * IRPEF_RATE;
    const irap = netProfit * IRAP_RATE;
    const ss = netProfit * SS_RATE;
    const totalTax = irpef + irap + ss;
    const netAfterTax = netProfit - totalTax;

    return { netProfit, irpef, irap, ss, totalTax, netAfterTax };
  }, [income, expenses]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Your numbers
        </h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="calc-income" className={labelClass}>Total income (€)</label>
          <input
            id="calc-income"
            type="number"
            min="0"
            step="0.01"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="calc-expenses" className={labelClass}>Total expenses (€)</label>
          <input
            id="calc-expenses"
            type="number"
            min="0"
            step="0.01"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            className={inputClass}
          />
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Pre-filled with your recorded totals — edit to try different scenarios.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Estimated tax breakdown
        </h2>

        <Row label="Net profit (income − expenses)" value={result.netProfit} bold />
        <Row label={`IRPEF (${(IRPEF_RATE * 100).toFixed(1)}%)`} value={result.irpef} negative />
        <Row label={`IRAP (${(IRAP_RATE * 100).toFixed(1)}%)`} value={result.irap} negative />
        <Row label={`Social security / INPS (${(SS_RATE * 100).toFixed(1)}%)`} value={result.ss} negative />

        <hr className="border-zinc-200 dark:border-zinc-800" />

        <Row label="Total estimated tax" value={result.totalTax} negative bold />
        <Row label="Net after tax" value={result.netAfterTax} bold tone="text-emerald-600 dark:text-emerald-400" />

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Rough estimate for Italian freelancers using simplified flat rates. Not tax advice — consult a commercialista for your actual regime (e.g. regime forfettario).
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  negative,
  bold,
  tone,
}: {
  label: string;
  value: number;
  negative?: boolean;
  bold?: boolean;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <span
        className={`${bold ? "font-semibold" : ""} ${tone ?? "text-zinc-900 dark:text-zinc-50"}`}
      >
        {negative ? "− " : ""}
        {formatCurrency(value)}
      </span>
    </div>
  );
}

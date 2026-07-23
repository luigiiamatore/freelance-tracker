"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";

const DEFAULT_COEFFICIENT = 78; // "Attività professionali" ATECO group — most common for freelance/consulting work.
const DEFAULT_SUBSTITUTE_RATE = 15; // 15% is the standard forfettario rate; 5% only applies for the first 5 years under specific conditions.
const DEFAULT_INPS_RATE = 26.07; // INPS Gestione Separata rate for freelancers without other pension coverage.

const inputClass =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-50";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";
const hintClass = "text-xs text-zinc-500 dark:text-zinc-400";

export default function TaxCalculator({
  defaultIncome,
  defaultExpenses,
}: {
  defaultIncome: number;
  defaultExpenses: number;
}) {
  const [revenue, setRevenue] = useState(defaultIncome.toFixed(2));
  const [expenses, setExpenses] = useState(defaultExpenses.toFixed(2));
  const [coefficient, setCoefficient] = useState(String(DEFAULT_COEFFICIENT));
  const [substituteRate, setSubstituteRate] = useState(String(DEFAULT_SUBSTITUTE_RATE));
  const [inpsRate, setInpsRate] = useState(String(DEFAULT_INPS_RATE));

  const result = useMemo(() => {
    const revenueNum = Math.max(0, Number(revenue) || 0);
    const expensesNum = Math.max(0, Number(expenses) || 0);
    const coefficientNum = Math.min(100, Math.max(0, Number(coefficient) || 0)) / 100;
    const substituteRateNum = Math.min(100, Math.max(0, Number(substituteRate) || 0)) / 100;
    const inpsRateNum = Math.min(100, Math.max(0, Number(inpsRate) || 0)) / 100;

    const taxableIncomeGross = revenueNum * coefficientNum;
    const inpsContributions = taxableIncomeGross * inpsRateNum;
    const taxableIncomeNet = Math.max(0, taxableIncomeGross - inpsContributions);
    const substituteTax = taxableIncomeNet * substituteRateNum;
    const totalTaxAndContributions = inpsContributions + substituteTax;
    const realNetProfit = revenueNum - expensesNum - totalTaxAndContributions;
    const reservePercent = revenueNum > 0 ? (totalTaxAndContributions / revenueNum) * 100 : 0;

    return {
      taxableIncomeGross,
      inpsContributions,
      taxableIncomeNet,
      substituteTax,
      totalTaxAndContributions,
      realNetProfit,
      reservePercent,
    };
  }, [revenue, expenses, coefficient, substituteRate, inpsRate]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Your numbers
        </h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="calc-revenue" className={labelClass}>Revenue (€)</label>
          <input
            id="calc-revenue"
            type="number"
            min="0"
            step="0.01"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="calc-expenses" className={labelClass}>Expenses (€)</label>
          <input
            id="calc-expenses"
            type="number"
            min="0"
            step="0.01"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            className={inputClass}
          />
          <p className={hintClass}>
            Under regime forfettario, expenses don&apos;t reduce your taxes — this is just to show your real profit below.
          </p>
        </div>

        <hr className="border-zinc-200 dark:border-zinc-800" />

        <div className="flex flex-col gap-1">
          <label htmlFor="calc-coefficient" className={labelClass}>Coefficiente di redditività (%)</label>
          <input
            id="calc-coefficient"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={coefficient}
            onChange={(e) => setCoefficient(e.target.value)}
            className={inputClass}
          />
          <p className={hintClass}>
            Depends on your activity&apos;s ATECO code — 78% is common for professional/consulting services.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="calc-substitute-rate" className={labelClass}>Imposta sostitutiva rate</label>
          <select
            id="calc-substitute-rate"
            value={substituteRate}
            onChange={(e) => setSubstituteRate(e.target.value)}
            className={inputClass}
          >
            <option value="15">15% (standard forfettario rate)</option>
            <option value="5">5% (first 5 years, if you meet the requirements)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="calc-inps-rate" className={labelClass}>INPS contribution rate (%)</label>
          <input
            id="calc-inps-rate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={inpsRate}
            onChange={(e) => setInpsRate(e.target.value)}
            className={inputClass}
          />
          <p className={hintClass}>
            26.07% is Gestione Separata with no other pension coverage — change it if you&apos;re artigiano/commerciante or have another cassa.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Estimated taxes (regime forfettario)
        </h2>

        <Row label="Gross taxable income (revenue × coefficient)" value={result.taxableIncomeGross} />
        <Row label="INPS contributions" value={result.inpsContributions} negative />
        <Row label="Net taxable income (after contributions)" value={result.taxableIncomeNet} />
        <Row label="Imposta sostitutiva" value={result.substituteTax} negative />

        <hr className="border-zinc-200 dark:border-zinc-800" />

        <Row label="Total taxes and contributions" value={result.totalTaxAndContributions} negative bold />

        {result.reservePercent > 0 && (
          <div className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
            💡 Set aside about <strong>{result.reservePercent.toFixed(1)}%</strong> of every invoice as it comes in, so taxes and contributions are already covered when they&apos;re due.
          </div>
        )}

        <Row
          label="Real net profit (revenue − expenses − taxes)"
          value={result.realNetProfit}
          bold
          tone="text-emerald-600 dark:text-emerald-400"
        />

        <p className={hintClass}>
          Indicative estimate for regime forfettario, Gestione Separata, with adjustable parameters. It deducts INPS as if accrued in the same year — in your actual return you deduct contributions actually paid, which usually relate to the prior year. Not tax advice — verify with a commercialista for your specific situation (especially if you&apos;re artigiano/commerciante or have a cassa professionale).
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

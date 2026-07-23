"use client";

import { useRouter, usePathname } from "next/navigation";
import type { PeriodGranularity, PeriodOption } from "@/lib/period";

const GRANULARITY_LABELS: Record<PeriodGranularity, string> = {
  all: "Tutto",
  month: "Mese",
  quarter: "Trimestre",
  year: "Anno",
};

export default function PeriodFilter({
  granularity,
  value,
  availablePeriods,
}: {
  granularity: PeriodGranularity;
  value: string | null;
  availablePeriods: Record<Exclude<PeriodGranularity, "all">, PeriodOption[]>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function goTo(nextGranularity: PeriodGranularity, nextValue: string | null) {
    if (nextGranularity === "all") {
      router.push(pathname);
      return;
    }
    const params = new URLSearchParams({ period: nextGranularity, value: nextValue ?? "" });
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleGranularityClick(nextGranularity: PeriodGranularity) {
    if (nextGranularity === "all") {
      goTo("all", null);
      return;
    }
    const options = availablePeriods[nextGranularity];
    if (options.length === 0) return;
    const current = nextGranularity === granularity ? value : null;
    const stillValid = current && options.some((o) => o.value === current);
    goTo(nextGranularity, stillValid ? current : options[0].value);
  }

  const options = granularity !== "all" ? availablePeriods[granularity] : [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-md border border-zinc-300 p-0.5 dark:border-zinc-700">
        {(Object.keys(GRANULARITY_LABELS) as PeriodGranularity[]).map((g) => {
          const disabled = g !== "all" && availablePeriods[g].length === 0;
          const active = g === granularity;
          return (
            <button
              key={g}
              type="button"
              disabled={disabled}
              onClick={() => handleGranularityClick(g)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {GRANULARITY_LABELS[g]}
            </button>
          );
        })}
      </div>

      {granularity !== "all" && options.length > 0 && (
        <select
          value={value ?? options[0].value}
          onChange={(e) => goTo(granularity, e.target.value)}
          className="rounded-md border border-zinc-300 bg-transparent px-2 py-1 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-50"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

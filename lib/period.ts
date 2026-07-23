export type PeriodGranularity = "all" | "month" | "quarter" | "year";

export type PeriodFilter = {
  granularity: PeriodGranularity;
  value: string | null;
};

export type DateRange = { start: string; end: string };

export type PeriodOption = { value: string; label: string };

export type TrendBucket = { key: string; label: string };

const pad = (n: number) => String(n).padStart(2, "0");

function nextMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

/** Reads `period`/`value` from page searchParams into a typed filter. Unknown or missing values fall back to "all". */
export function parsePeriodFilter(searchParams: {
  period?: string | string[];
  value?: string | string[];
}): PeriodFilter {
  const period = Array.isArray(searchParams.period) ? searchParams.period[0] : searchParams.period;
  const value = Array.isArray(searchParams.value) ? searchParams.value[0] : searchParams.value;

  if ((period === "month" || period === "quarter" || period === "year") && value) {
    return { granularity: period, value };
  }
  return { granularity: "all", value: null };
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function quarterKey(date: string): string {
  const year = date.slice(0, 4);
  const month = Number(date.slice(5, 7));
  return `${year}-Q${Math.ceil(month / 3)}`;
}

export function yearKey(date: string): string {
  return date.slice(0, 4);
}

/** The half-open [start, end) date range (YYYY-MM-DD) a filter selects, or null for "all". */
export function dateRangeForFilter(filter: PeriodFilter): DateRange | null {
  if (filter.granularity === "all" || !filter.value) return null;

  if (filter.granularity === "month") {
    const year = Number(filter.value.slice(0, 4));
    const month = Number(filter.value.slice(5, 7));
    const end = nextMonth(year, month);
    return {
      start: `${year}-${pad(month)}-01`,
      end: `${end.year}-${pad(end.month)}-01`,
    };
  }

  if (filter.granularity === "quarter") {
    const [yearStr, qStr] = filter.value.split("-Q");
    const year = Number(yearStr);
    const startMonth = (Number(qStr) - 1) * 3 + 1;
    let end = { year, month: startMonth };
    for (let i = 0; i < 3; i++) end = nextMonth(end.year, end.month);
    return {
      start: `${year}-${pad(startMonth)}-01`,
      end: `${end.year}-${pad(end.month)}-01`,
    };
  }

  const year = Number(filter.value);
  return { start: `${year}-01-01`, end: `${year + 1}-01-01` };
}

export function filterByRange<T extends { date: string }>(items: T[], range: DateRange | null): T[] {
  if (!range) return items;
  return items.filter((item) => item.date >= range.start && item.date < range.end);
}

export function formatPeriodLabel(value: string, granularity: Exclude<PeriodGranularity, "all">): string {
  if (granularity === "year") return value;

  if (granularity === "quarter") {
    const [year, q] = value.split("-Q");
    return `T${q} ${year}`;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const label = new Date(year, month - 1, 1).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Human-readable label for the currently selected filter, e.g. "Luglio 2026" or "Ultimi 6 mesi". */
export function describeFilter(filter: PeriodFilter): string {
  if (filter.granularity === "all" || !filter.value) return "Ultimi 6 mesi";
  return formatPeriodLabel(filter.value, filter.granularity);
}

/** Distinct periods (most recent first) actually present in the given dates, for populating filter options. */
export function getAvailablePeriods(
  dates: string[],
  granularity: Exclude<PeriodGranularity, "all">
): PeriodOption[] {
  const keyFn = granularity === "month" ? monthKey : granularity === "quarter" ? quarterKey : yearKey;
  const keys = Array.from(new Set(dates.map(keyFn))).sort().reverse();
  return keys.map((value) => ({ value, label: formatPeriodLabel(value, granularity) }));
}

/** Month/day buckets to plot the income trend chart against, for the given filter. */
export function buildTrendBuckets(filter: PeriodFilter): TrendBucket[] {
  if (filter.granularity === "year" && filter.value) {
    const year = Number(filter.value);
    return Array.from({ length: 12 }, (_, i) => ({
      key: `${year}-${pad(i + 1)}`,
      label: new Date(year, i, 1).toLocaleDateString("it-IT", { month: "short" }),
    }));
  }

  if (filter.granularity === "quarter" && filter.value) {
    const [yearStr, qStr] = filter.value.split("-Q");
    const year = Number(yearStr);
    const startMonth = (Number(qStr) - 1) * 3;
    return Array.from({ length: 3 }, (_, i) => {
      const month = startMonth + i;
      return {
        key: `${year}-${pad(month + 1)}`,
        label: new Date(year, month, 1).toLocaleDateString("it-IT", { month: "short" }),
      };
    });
  }

  if (filter.granularity === "month" && filter.value) {
    const year = Number(filter.value.slice(0, 4));
    const month = Number(filter.value.slice(5, 7));
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({
      key: `${year}-${pad(month)}-${pad(i + 1)}`,
      label: String(i + 1),
    }));
  }

  const months: TrendBucket[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`,
      label: d.toLocaleDateString("it-IT", { month: "short" }),
    });
  }
  return months;
}

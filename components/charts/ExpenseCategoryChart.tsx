"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useIsDark } from "@/lib/useIsDark";
import { formatCurrency } from "@/lib/format";
import type { ExpenseCategory } from "@/lib/types";

type Point = { category: ExpenseCategory; total: number };

const LIGHT_SLOTS: Record<ExpenseCategory, string> = {
  Software: "#2a78d6",
  Travel: "#008300",
  Office: "#e87ba4",
  Other: "#eda100",
};
const DARK_SLOTS: Record<ExpenseCategory, string> = {
  Software: "#3987e5",
  Travel: "#008300",
  Office: "#d55181",
  Other: "#c98500",
};
const LIGHT = { grid: "#e1e0d9", text: "#898781", surface: "#fcfcfb", ink: "#0b0b0b" };
const DARK = { grid: "#2c2c2a", text: "#898781", surface: "#1a1a19", ink: "#ffffff" };

export default function ExpenseCategoryChart({ data }: { data: Point[] }) {
  const isDark = useIsDark();
  const c = isDark ? DARK : LIGHT;
  const slots = isDark ? DARK_SLOTS : LIGHT_SLOTS;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Expenses by category
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis
            dataKey="category"
            tick={{ fill: c.ink, fontSize: 12 }}
            axisLine={{ stroke: c.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: c.text, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) => formatCurrency(v).replace(",00", "")}
          />
          <Tooltip
            cursor={{ fill: c.grid, opacity: 0.4 }}
            contentStyle={{
              background: c.surface,
              border: `1px solid ${c.grid}`,
              borderRadius: 8,
              fontSize: 12,
              color: c.ink,
            }}
            formatter={(value) => [formatCurrency(Number(value)), "Total"]}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={64}>
            {data.map((entry) => (
              <Cell key={entry.category} fill={slots[entry.category]} />
            ))}
            <LabelList
              dataKey="total"
              position="top"
              formatter={(v) => formatCurrency(Number(v)).replace(",00", "")}
              style={{ fill: c.ink, fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

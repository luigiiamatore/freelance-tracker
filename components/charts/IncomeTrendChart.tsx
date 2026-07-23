"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useIsDark } from "@/lib/useIsDark";
import { formatCurrency } from "@/lib/format";

type Point = { month: string; total: number };

const LIGHT = { line: "#2a78d6", grid: "#e1e0d9", text: "#898781", surface: "#fcfcfb", ink: "#0b0b0b" };
const DARK = { line: "#3987e5", grid: "#2c2c2a", text: "#898781", surface: "#1a1a19", ink: "#ffffff" };

export default function IncomeTrendChart({
  data,
  title = "Income trend (last 6 months)",
}: {
  data: Point[];
  title?: string;
}) {
  const isDark = useIsDark();
  const c = isDark ? DARK : LIGHT;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis
            dataKey="month"
            tick={{ fill: c.text, fontSize: 12 }}
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
            cursor={{ stroke: c.grid, strokeWidth: 1 }}
            contentStyle={{
              background: c.surface,
              border: `1px solid ${c.grid}`,
              borderRadius: 8,
              fontSize: 12,
              color: c.ink,
            }}
            formatter={(value) => [formatCurrency(Number(value)), "Income"]}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke={c.line}
            strokeWidth={2}
            dot={{ r: 4, fill: c.line, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

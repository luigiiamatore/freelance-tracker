import { formatCurrency } from "@/lib/format";

export default function StatsCards({
  totalIncome,
  totalExpenses,
  netProfit,
}: {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}) {
  const cards = [
    { label: "Total income", value: totalIncome, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Total expenses", value: totalExpenses, tone: "text-red-600 dark:text-red-400" },
    {
      label: "Net profit",
      value: netProfit,
      tone: netProfit >= 0 ? "text-zinc-900 dark:text-zinc-50" : "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${card.tone}`}>
            {formatCurrency(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

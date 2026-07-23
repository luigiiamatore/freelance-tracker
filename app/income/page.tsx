import { createClient } from "@/lib/supabase/server";
import { getAttachmentsByParent } from "@/lib/attachments";
import IncomeForm from "@/components/IncomeForm";
import IncomeList from "@/components/IncomeList";
import type { Income } from "@/lib/types";

export default async function IncomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("income")
    .select("*")
    .order("date", { ascending: false });

  const income = (data ?? []) as Income[];
  const attachmentsByIncomeId = await getAttachmentsByParent({
    supabase,
    column: "income_id",
    parentIds: income.map((item) => item.id),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Income</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Track invoices you&apos;ve sent to clients.
        </p>
      </div>
      <IncomeForm />
      <IncomeList income={income} attachmentsByIncomeId={attachmentsByIncomeId} />
    </div>
  );
}

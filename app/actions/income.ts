"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type IncomeFormState = { error: string } | undefined;

export async function addIncome(
  _prevState: IncomeFormState,
  formData: FormData
): Promise<IncomeFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in." };
  }

  const client = String(formData.get("client") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const date = String(formData.get("date") ?? "");
  const status = String(formData.get("status") ?? "pending");
  const invoiceId = String(formData.get("invoice_id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!client || !date || !Number.isFinite(amount) || amount < 0) {
    return { error: "Please fill in client, a valid amount, and date." };
  }

  const { error } = await supabase.from("income").insert({
    user_id: user.id,
    client,
    amount,
    date,
    status,
    invoice_id: invoiceId || null,
    notes: notes || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/income");
  revalidatePath("/");
}

export async function deleteIncome(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("income").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/income");
  revalidatePath("/");
}

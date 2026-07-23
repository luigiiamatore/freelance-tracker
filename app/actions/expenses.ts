"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { uploadAttachments } from "@/lib/attachments";

export type ExpenseFormState = { error: string } | undefined;

export async function addExpense(
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in." };
  }

  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const date = String(formData.get("date") ?? "");
  const category = String(formData.get("category") ?? "");

  if (!description || !date || !Number.isFinite(amount) || amount < 0) {
    return { error: "Please fill in description, a valid amount, and date." };
  }
  if (!EXPENSE_CATEGORIES.includes(category as (typeof EXPENSE_CATEGORIES)[number])) {
    return { error: "Please choose a valid category." };
  }

  const { data: inserted, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      description,
      amount,
      date,
      category,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  const files = formData.getAll("attachments").filter(
    (value): value is File => value instanceof File && value.size > 0
  );

  if (files.length > 0) {
    const uploadError = await uploadAttachments({
      supabase,
      userId: user.id,
      files,
      parent: { expense_id: inserted.id },
    });
    if (uploadError) {
      return { error: uploadError };
    }
  }

  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function deleteExpense(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/expenses");
  revalidatePath("/");
}

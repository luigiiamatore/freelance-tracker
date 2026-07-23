"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ATTACHMENT_BUCKET } from "@/lib/attachments";

export async function deleteAttachment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  const source = String(formData.get("source") ?? "");
  if (!id) return;

  const { data: attachment } = await supabase
    .from("attachments")
    .select("file_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!attachment) return;

  await supabase.storage.from(ATTACHMENT_BUCKET).remove([attachment.file_path]);
  await supabase.from("attachments").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath(source === "expenses" ? "/expenses" : "/income");
  revalidatePath("/");
}

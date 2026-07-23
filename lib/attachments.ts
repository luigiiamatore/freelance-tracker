import type { createClient } from "@/lib/supabase/server";
import type { AttachmentWithUrl } from "@/lib/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export const ATTACHMENT_BUCKET = "attachments";
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_UPLOAD = 5;
export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
];

type AttachmentParent = { income_id: string } | { expense_id: string };

/** Uploads files to Storage and records them in `attachments`. Returns an error message, or null on success. */
export async function uploadAttachments({
  supabase,
  userId,
  files,
  parent,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  files: File[];
  parent: AttachmentParent;
}): Promise<string | null> {
  if (files.length > MAX_ATTACHMENTS_PER_UPLOAD) {
    return `You can attach at most ${MAX_ATTACHMENTS_PER_UPLOAD} files at once.`;
  }

  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_SIZE) {
      return `"${file.name}" is larger than 5MB.`;
    }
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      return `"${file.name}" must be a PDF, PNG, or JPEG file.`;
    }
  }

  for (const file of files) {
    const extension = file.name.includes(".") ? file.name.split(".").pop() : undefined;
    const path = `${userId}/${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;

    const { error: uploadError } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .upload(path, file, { contentType: file.type });
    if (uploadError) return uploadError.message;

    const { error: insertError } = await supabase.from("attachments").insert({
      user_id: userId,
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      content_type: file.type,
      ...parent,
    });
    if (insertError) return insertError.message;
  }

  return null;
}

/** Fetches attachments for the given rows and groups them by parent id, with signed view URLs. */
export async function getAttachmentsByParent({
  supabase,
  column,
  parentIds,
}: {
  supabase: SupabaseServerClient;
  column: "income_id" | "expense_id";
  parentIds: string[];
}): Promise<Record<string, AttachmentWithUrl[]>> {
  if (parentIds.length === 0) return {};

  const { data } = await supabase
    .from("attachments")
    .select("*")
    .in(column, parentIds)
    .order("created_at", { ascending: true });

  const attachments = data ?? [];
  if (attachments.length === 0) return {};

  const { data: signedUrls } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrls(
      attachments.map((a) => a.file_path),
      60 * 60
    );

  const urlByPath = new Map(
    (signedUrls ?? []).map((entry) => [entry.path, entry.signedUrl])
  );

  const grouped: Record<string, AttachmentWithUrl[]> = {};
  for (const attachment of attachments) {
    const parentId = attachment[column] as string;
    const withUrl: AttachmentWithUrl = {
      ...attachment,
      url: urlByPath.get(attachment.file_path) ?? null,
    };
    (grouped[parentId] ??= []).push(withUrl);
  }
  return grouped;
}

import { deleteAttachment } from "@/app/actions/attachments";
import { formatFileSize } from "@/lib/format";
import type { AttachmentWithUrl } from "@/lib/types";

export default function AttachmentList({
  attachments,
  source,
}: {
  attachments: AttachmentWithUrl[];
  source: "income" | "expenses";
}) {
  if (attachments.length === 0) return null;

  return (
    <ul className="mt-1 flex flex-col gap-0.5">
      {attachments.map((attachment) => (
        <li key={attachment.id} className="flex items-center gap-1.5 text-xs">
          {attachment.url ? (
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-indigo-600 hover:underline dark:text-indigo-400"
              title={attachment.file_name}
            >
              📎 {attachment.file_name}
            </a>
          ) : (
            <span className="truncate text-zinc-400">📎 {attachment.file_name}</span>
          )}
          <span className="text-zinc-400 dark:text-zinc-500">
            ({formatFileSize(attachment.file_size)})
          </span>
          <form action={deleteAttachment}>
            <input type="hidden" name="id" value={attachment.id} />
            <input type="hidden" name="source" value={source} />
            <button
              type="submit"
              className="text-zinc-400 transition-colors hover:text-red-600 dark:hover:text-red-400"
              aria-label={`Remove attachment ${attachment.file_name}`}
            >
              ×
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("it-IT", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(date));
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

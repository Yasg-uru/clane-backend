const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("en-IN", { notation: "compact" });

export function formatCurrency(amount: number): string {
  return inrFormatter.format(amount);
}

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(date));
}

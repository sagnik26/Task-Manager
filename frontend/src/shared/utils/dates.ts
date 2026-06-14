/** Normalize API/DB due dates to YYYY-MM-DD for inputs and display. */
export function normalizeDueDate(
  value: string | null | undefined,
): string | null {
  if (value == null || value === "") return null;

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const datePrefix = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (datePrefix) return datePrefix[1];

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
}

export function toDateInputValue(value: string | null | undefined): string {
  return normalizeDueDate(value) ?? "";
}

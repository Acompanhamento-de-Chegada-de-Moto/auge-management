import "server-only";

export function normalizeDateFields(
  value: unknown,
  fields: readonly string[],
): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;

  const body = { ...value } as Record<string, unknown>;
  for (const field of fields) {
    const entry = body[field];
    if (typeof entry === "string") {
      const date = new Date(entry);
      if (!Number.isNaN(date.getTime())) body[field] = date;
    }
  }
  return body;
}

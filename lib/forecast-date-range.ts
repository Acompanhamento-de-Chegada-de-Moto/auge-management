import { format, parseISO } from "date-fns";
import { z } from "zod";

const optionalDate = z.union([z.literal(""), z.iso.date()]);

export const forecastDateRangeSchema = z
  .object({ forecastFrom: optionalDate, forecastTo: optionalDate })
  .refine(
    ({ forecastFrom, forecastTo }) =>
      !forecastFrom || !forecastTo || forecastFrom <= forecastTo,
    {
      path: ["forecastTo"],
      message: "A data final deve ser igual ou posterior à data inicial.",
    },
  );

export type ForecastDateRange = z.infer<typeof forecastDateRangeSchema>;

export function formatForecastDateRange({
  forecastFrom,
  forecastTo,
}: ForecastDateRange) {
  const from = forecastFrom ? format(parseISO(forecastFrom), "dd/MM/yyyy") : "";
  const to = forecastTo ? format(parseISO(forecastTo), "dd/MM/yyyy") : "";
  if (from && to) return `${from} a ${to}`;
  return from ? `A partir de ${from}` : to ? `Até ${to}` : "";
}

export function normalizeForecastDateRange(params: {
  forecastFrom?: unknown;
  forecastTo?: unknown;
}): ForecastDateRange {
  const result = forecastDateRangeSchema.safeParse({
    forecastFrom:
      typeof params.forecastFrom === "string" ? params.forecastFrom : "",
    forecastTo: typeof params.forecastTo === "string" ? params.forecastTo : "",
  });
  return result.success ? result.data : { forecastFrom: "", forecastTo: "" };
}

export function forecastDateBounds(params: {
  forecastFrom?: string;
  forecastTo?: string;
}) {
  const { forecastFrom, forecastTo } = normalizeForecastDateRange(params);
  if (!forecastFrom && !forecastTo) return undefined;
  const end = forecastTo ? new Date(`${forecastTo}T00:00:00.000Z`) : undefined;
  // Forecasts are calendar dates stored by their UTC date portion.
  if (end) end.setUTCDate(end.getUTCDate() + 1);
  return {
    ...(forecastFrom ? { gte: new Date(`${forecastFrom}T00:00:00.000Z`) } : {}),
    ...(end ? { lt: end } : {}),
  };
}

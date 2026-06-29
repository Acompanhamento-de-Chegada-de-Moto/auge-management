import dayjs from "dayjs";

export function parseExcelDate(value: unknown): Date | undefined {
  if (value == null || value === "") return undefined;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "number" && value > 0) {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + value * 86400000);
  }

  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // dd/mm/yyyy
  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // dd/mm/yy
  const brShortMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (brShortMatch) {
    const [, day, month, shortYear] = brShortMatch;
    const year = 2000 + Number(shortYear);
    return new Date(
      year > 2050 ? year - 100 : year,
      Number(month) - 1,
      Number(day),
    );
  }

  // dd/mm/yyyy hh:mm:ss
  const brDateTimeMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})\s/);
  if (brDateTimeMatch) {
    const [, day, month, year] = brDateTimeMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // yyyy-mm-dd
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // yyyy-mm-dd hh:mm:ss
  const isoDateTimeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s/);
  if (isoDateTimeMatch) {
    const [, year, month, day] = isoDateTimeMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export type ArrivalStatusValue = "NO_INFORMATION" | "ARRIVED" | "DELAYED";

export function getArrivalStatus(
  forecastDate: Date | null | undefined,
  arrivalStatus?: ArrivalStatusValue | null,
) {
  if (arrivalStatus === "ARRIVED") {
    return {
      label: "Chegou",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  if (arrivalStatus === "DELAYED") {
    return {
      label: "Atrasada",
      color:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
  }

  if (!forecastDate) {
    return {
      label: "Em Trânsito",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  const hoje = dayjs().startOf("day");
  const arrival = dayjs(forecastDate).startOf("day");

  if (arrival.isAfter(hoje)) {
    return {
      label: "Em Trânsito",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  return {
    label: "Chegou",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };
}

export function getForecastStatus(
  forecastDate: Date | null | undefined,
  arrivalStatus?: ArrivalStatusValue | null,
) {
  if (arrivalStatus === "ARRIVED") {
    return {
      label: "Chegou",
      color:
        "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  if (arrivalStatus === "DELAYED") {
    return {
      label: "Atrasada",
      color:
        "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    };
  }

  if (!forecastDate) {
    return {
      label: "Sem Previsão",
      color:
        "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  const hoje = dayjs().startOf("day");
  const forecast = dayjs(forecastDate).startOf("day");

  if (forecast.isAfter(hoje)) {
    return {
      label: "Previsão Futura",
      color:
        "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  return {
    label: "Previsão Passada",
    color:
      "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  };
}

export function mapRegistrationStatusLabel(status: string | null | undefined) {
  const map: Record<string, string> = {
    NO_PLATE: "Sem Emplacamento",
    PLATING: "Emplacando",
    PLATED: "Emplacado",
  };
  return map[status ?? ""] ?? "Sem Emplacamento";
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Sem Emplacamento":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    case "Emplacando":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "Emplacado":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
}

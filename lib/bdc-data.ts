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

export function getArrivalStatus(arrivalDate: Date | null | undefined) {
  if (!arrivalDate) {
    return {
      label: "Não Chegou",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
  }

  const hoje = dayjs().startOf("day");
  const arrival = dayjs(arrivalDate).startOf("day");

  if (arrival.isBefore(hoje) || arrival.isSame(hoje, "day")) {
    return {
      label: "Chegou",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  return {
    label: "Não Chegou",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
}

export function mapRegistrationStatusLabel(
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
) {
  const map = {
    PENDING: "Pendente",
    IN_PROGRESS: "Em Emplacamento",
    COMPLETED: "Emplacado",
  } as const;
  return map[status];
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Pendente":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Em Emplacamento":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "Emplacado":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
}

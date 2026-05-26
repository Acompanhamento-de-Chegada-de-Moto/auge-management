import dayjs from "dayjs";

export interface BDCItem {
  id: string;
  cliente: string;
  vendedor: string;
  cidade: string;
  modelo: string;
  chassi: string;
  dataFaturamento: string;
  dataChegada: string;
  situacao: string;
}

export function parseExcelDate(value: unknown): Date | undefined {
  if (!value) return undefined;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const excelDays = value * 24 * 60 * 60 * 1000;
    return new Date(excelEpoch.getTime() + excelDays);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) {
      const [, day, month, year] = brMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

export function getStatusChegada(dataChegada: Date | null | undefined) {
  if (!dataChegada) {
    return {
      label: "Não Chegou",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
  }

  const hoje = dayjs().startOf("day");
  const chegada = dayjs(dataChegada).startOf("day");

  if (chegada.isBefore(hoje) || chegada.isSame(hoje, "day")) {
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

export function getSituacaoColor(situacao: string) {
  switch (situacao) {
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

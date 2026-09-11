import dayjs from "dayjs";

export function getArrivalStatus(
  forecastDate: Date | null | undefined,
  arrivalStatus?: string | null,
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
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
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

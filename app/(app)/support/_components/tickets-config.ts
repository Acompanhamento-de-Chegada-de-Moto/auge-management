export const priorityConfig: Record<
  string,
  { label: string; className: string }
> = {
  NORMAL: {
    label: "Normal",
    className:
      "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  HIGH: {
    label: "Alta",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  URGENT: {
    label: "Urgente",
    className:
      "border-red-200 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

export const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  OPEN: {
    label: "Aberto",
    className:
      "border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    className:
      "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  RESOLVED: {
    label: "Resolvido",
    className:
      "border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  },
  CLOSED: {
    label: "Fechado",
    className:
      "border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  },
};

export const statusOptions = ["IN_PROGRESS", "RESOLVED", "CLOSED"];

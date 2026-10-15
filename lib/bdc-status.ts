import type { CustomerFormData } from "@/validators/customer-schema";

export type MotorcycleArrivalStatus = "NO_INFORMATION" | "ARRIVED" | "DELAYED";

const arrivalStatusMap: Record<string, MotorcycleArrivalStatus> = {
  "Sem Informação": "NO_INFORMATION",
  Chegou: "ARRIVED",
  Atrasada: "DELAYED",
};

export function mapArrivalStatus(
  submitted: string | undefined,
): MotorcycleArrivalStatus {
  return arrivalStatusMap[submitted ?? ""] ?? "NO_INFORMATION";
}

export function mapRegistrationStatus(
  status: CustomerFormData["registrationStatus"],
) {
  const statusMap = {
    "Sem Emplacamento": "NO_PLATE",
    Emplacando: "PLATING",
    Emplacado: "PLATED",
  } as const;

  return statusMap[status];
}

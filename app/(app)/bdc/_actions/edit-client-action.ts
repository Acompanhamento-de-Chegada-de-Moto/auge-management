"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { updateBDCClient } from "@/lib/data/client";
import type { ApiResponse } from "@/lib/types";
import {
  type CustomerFormData,
  customerSchema,
} from "@/validators/customer-schema";
import {
  mapArrivalStatus,
  mapRegistrationStatus,
} from "../_lib/status-mappers";

export async function EditClientAction(
  clientId: string,
  motorcycleId: string | null,
  values: CustomerFormData,
): Promise<ApiResponse> {
  await requireAuth();

  const parsed = customerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ?? "Dados do formulário inválidos.",
    };
  }

  const data = parsed.data;
  const chassis = data.chassis.trim().toUpperCase();
  const additionalChassis = data.newChassis?.trim().toUpperCase() || undefined;

  if (!chassis) {
    return { status: "error", message: "Informe o chassi da motocicleta." };
  }
  if (additionalChassis === chassis) {
    return {
      status: "error",
      message: "O chassi adicional deve ser diferente do chassi principal.",
    };
  }

  try {
    const error = await updateBDCClient({
      clientId,
      motorcycleId,
      cpf: data.cpf,
      name: data.customerName,
      sellerName: data.sellerName,
      city: data.city,
      billingDate: data.billingDate,
      motorcycle: {
        chassis,
        model: data.model,
        forecastDate: data.forecastDate,
        arrivalStatus: mapArrivalStatus(data.arrivalStatus),
        arrivalStatusInput: data.arrivalStatus,
        registrationStatus: mapRegistrationStatus(data.registrationStatus),
        registrationDate: data.registrationDate,
      },
      additionalMotorcycle: additionalChassis
        ? {
            chassis: additionalChassis,
            model: data.newModel ?? "",
            forecastDate: data.newForecastDate,
          }
        : undefined,
    });

    if (error) return { status: "error", message: error };
  } catch (error) {
    console.error("Erro ao editar cliente:", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Erro interno ao atualizar os dados do cliente.",
    };
  }

  revalidatePath("/bdc");
  revalidatePath("/inventory");
  revalidatePath("/tracking", "layout");
  return {
    status: "success",
    message: "Cadastro do cliente atualizado com sucesso.",
  };
}

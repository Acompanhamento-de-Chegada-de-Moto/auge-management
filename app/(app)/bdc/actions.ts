"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { getClientById, updateClient } from "@/lib/data/client";
import {
  updateMotorcycle,
  getMotorcycleByChassis,
} from "@/lib/data/motorcycle";
import type { ApiResponse } from "@/lib/types";
import {
  type CustomerFormData,
  customerSchema,
} from "@/validators/customer-schema";

export async function getClientByIdAction(id: string) {
  await requireAuth();
  return getClientById(id);
}

export async function EditClientAction(
  clientId: string,
  values: CustomerFormData,
): Promise<ApiResponse> {
  await requireAuth();

  const parsed = customerSchema.safeParse(values);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      status: "error",
      message: firstIssue?.message ?? "Dados do formulário inválidos.",
    };
  }

  try {
    const { customerName, cpf, sellerName, city, billingDate, chassis, model, forecastDate, registrationStatus, registrationDate } = parsed.data;

    const client = await getClientById(clientId);
    if (!client) {
      return { status: "error", message: "Cliente não encontrado." };
    }

    await updateClient(clientId, {
      cpf,
      name: customerName,
      sellerName,
      city,
      billingDate: billingDate ?? null,
    });

    const motorcycle = client.motorcycles[0];
    if (motorcycle) {
      if (chassis !== motorcycle.chassi) {
        const chassiExists = await getMotorcycleByChassis(chassis);
        if (chassiExists) {
          return {
            status: "error",
            message: "Este chassi já está cadastrado em outra motocicleta.",
          };
        }
      }

      await updateMotorcycle(motorcycle.id, {
        chassi: chassis,
        model,
        forecastArrival: forecastDate ?? null,
        registrationStatus: registrationStatus === "Emplacado"
          ? "PLATED"
          : registrationStatus === "Emplacando"
            ? "PLATING"
            : "NO_PLATE",
        registrationDate: registrationDate ?? null,
      });
    }

    revalidatePath("/bdc");
    revalidatePath("/acompanhamento", "layout");

    return {
      status: "success",
      message: "Cliente atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao editar cliente:", error);
    return {
      status: "error",
      message: "Erro interno ao atualizar os dados do cliente.",
    };
  }
}

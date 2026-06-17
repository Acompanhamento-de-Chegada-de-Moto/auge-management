"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/require-auth";
import { updateClient as dalUpdateClient } from "@/lib/data/client";
import {
  getMotorcycleByChassis,
  updateMotorcycleByChassis,
} from "@/lib/data/motorcycle";
import { customerSchema } from "@/validators/customer-schema";

function mapRegistrationStatus(
  status: "Sem Emplacamento" | "Emplacando" | "Emplacado",
): "NO_PLATE" | "PLATING" | "PLATED" {
  const map = {
    "Sem Emplacamento": "NO_PLATE",
    Emplacando: "PLATING",
    Emplacado: "PLATED",
  } as const;
  return map[status];
}

export async function updateClientAction(clientId: string, formData: unknown) {
  await requireAuth();

  const parsed = customerSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    await dalUpdateClient(clientId, {
      cpf: data.cpf,
      name: data.customerName,
      sellerName: data.sellerName,
      city: data.city,
      billingDate: data.billingDate ?? null,
    });

    if (data.chassis) {
      await updateMotorcycleByChassis(data.chassis, {
        model: data.model,
        forecastDate: data.forecastDate ?? null,
        registrationStatus: mapRegistrationStatus(data.registrationStatus),
        registrationStatusDate: data.plateDate,
      });
    }

    revalidatePath("/bdc");
    revalidatePath("/estoque");

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar cliente." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/require-user";
import { createClient as dalCreateClient } from "@/lib/data/client";
import {
  createMotorcycle,
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

export async function createClientAction(formData: unknown) {
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
    const client = await dalCreateClient({
      cpf: data.cpf,
      name: data.customerName,
      sellerName: data.sellerName,
      city: data.city,
      billingDate: data.billingDate,
    });

    if (data.chassis) {
      const existingMoto = await getMotorcycleByChassis(data.chassis);

      if (existingMoto) {
        await updateMotorcycleByChassis(data.chassis, {
          model: data.model,
          forecastDate: data.forecastDate ?? null,
          registrationStatus: mapRegistrationStatus(data.registrationStatus),
          registrationStatusDate: data.plateDate,
          clientId: client.id,
        });
      } else {
        await createMotorcycle({
          chassis: data.chassis,
          model: data.model,
          forecastDate: data.forecastDate ?? null,
          registrationStatus: mapRegistrationStatus(data.registrationStatus),
          registrationStatusDate: data.plateDate,
          clientId: client.id,
        });
      }
    }

    revalidatePath("/bdc");
    revalidatePath("/logistica");

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao salvar cliente." };
  }
}

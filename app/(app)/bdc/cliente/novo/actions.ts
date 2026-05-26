"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/app/data/require-user";
import { createClient as dalCreateClient } from "@/lib/data/client";
import {
  createMotorcycle,
  getMotorcycleByChassis,
  updateMotorcycleByChassis,
} from "@/lib/data/motorcycle";
import { customerSchema } from "@/validators/customer-schema";

function mapRegistrationStatus(
  status: "Pendente" | "Em Emplacamento" | "Emplacado",
): "PENDING" | "IN_PROGRESS" | "COMPLETED" {
  const map = {
    Pendente: "PENDING",
    "Em Emplacamento": "IN_PROGRESS",
    Emplacado: "COMPLETED",
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
          arrivalDate: data.hasArrived ? data.arrivalDate : null,
          registrationStatus: mapRegistrationStatus(data.registrationStatus),
          registrationStatusDate: data.plateDate,
          clientId: client.id,
        });
      } else {
        await createMotorcycle({
          chassis: data.chassis,
          model: data.model,
          arrivalDate: data.hasArrived ? data.arrivalDate : null,
          registrationStatus: mapRegistrationStatus(data.registrationStatus),
          registrationStatusDate: data.plateDate,
          clientId: client.id,
        });
      }
    }

    revalidatePath("/bdc");
    redirect("/bdc");
  } catch {
    return { success: false, error: "Erro ao salvar cliente." };
  }
}

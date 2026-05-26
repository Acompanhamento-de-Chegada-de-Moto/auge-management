"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/app/data/require-user";
import {
  getClientById as dalGetClientById,
  updateClient as dalUpdateClient,
} from "@/lib/data/client";
import {
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

export async function getClientByIdAction(id: string) {
  await requireAuth();
  return dalGetClientById(id);
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
      name: data.customerName,
      sellerName: data.sellerName,
      city: data.city,
      billingDate: data.billingDate ?? null,
    });

    if (data.chassis) {
      await updateMotorcycleByChassis(data.chassis, {
        model: data.model,
        arrivalDate: data.hasArrived ? data.arrivalDate : null,
        registrationStatus: mapRegistrationStatus(data.registrationStatus),
        registrationStatusDate: data.plateDate,
      });
    }

    revalidatePath("/bdc");
    redirect("/bdc");
  } catch {
    return { success: false, error: "Erro ao atualizar cliente." };
  }
}

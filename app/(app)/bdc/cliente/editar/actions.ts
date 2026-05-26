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

function mapStatusRegistro(
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
      name: data.cliente,
      sellerName: data.vendedor,
      city: data.cidade,
      billingDate: data.dataFaturamento ?? null,
    });

    if (data.chassi) {
      await updateMotorcycleByChassis(data.chassi, {
        model: data.modelo,
        arrivalDate: data.motoChegou ? data.dataChegada : null,
        registrationStatus: mapStatusRegistro(data.statusRegistro),
        registrationStatusDate: data.dataEmplacamento,
      });
    }

    revalidatePath("/bdc");
    redirect("/bdc");
  } catch {
    return { success: false, error: "Erro ao atualizar cliente." };
  }
}

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
import { createAuditLog } from "@/lib/data/audit-log";
import { sanitizeForAudit } from "@/lib/utils";
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
  const user = await requireAuth();

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
    const oldClient = await dalGetClientById(clientId);
    const updatedClient = await dalUpdateClient(clientId, {
      name: data.cliente,
      sellerName: data.vendedor,
      city: data.cidade,
      billingDate: data.dataFaturamento ?? null,
    });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: "UPDATE",
      entityType: "CLIENT",
      entityId: clientId,
      entityName: updatedClient.name,
      oldValue: sanitizeForAudit(oldClient),
      newValue: sanitizeForAudit(updatedClient),
    });

    if (data.chassi) {
      const oldMoto = await getMotorcycleByChassis(data.chassi);
      const updatedMoto = await updateMotorcycleByChassis(data.chassi, {
        model: data.modelo,
        arrivalDate: data.motoChegou ? data.dataChegada : null,
        registrationStatus: mapStatusRegistro(data.statusRegistro),
        registrationStatusDate: data.dataEmplacamento,
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: "UPDATE",
        entityType: "MOTORCYCLE",
        entityId: oldMoto?.id ?? updatedMoto.id,
        entityName: data.modelo,
        oldValue: sanitizeForAudit(oldMoto),
        newValue: sanitizeForAudit(updatedMoto),
      });
    }

    revalidatePath("/bdc");
    redirect("/bdc");
  } catch {
    return { success: false, error: "Erro ao atualizar cliente." };
  }
}

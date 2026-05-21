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

export async function createClientAction(formData: unknown) {
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
    const client = await dalCreateClient({
      name: data.cliente,
      sellerName: data.vendedor,
      city: data.cidade,
      billingDate: data.dataFaturamento,
    });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: "CREATE",
      entityType: "CLIENT",
      entityId: client.id,
      entityName: client.name,
      newValue: sanitizeForAudit(client),
    });

    if (data.chassi) {
      const existingMoto = await getMotorcycleByChassis(data.chassi);

      if (existingMoto) {
        const updated = await updateMotorcycleByChassis(data.chassi, {
          model: data.modelo,
          arrivalDate: data.motoChegou ? data.dataChegada : null,
          registrationStatus: mapStatusRegistro(data.statusRegistro),
          registrationStatusDate: data.dataEmplacamento,
          clientId: client.id,
        });

        await createAuditLog({
          userId: user.id,
          userName: user.name,
          action: "UPDATE",
          entityType: "MOTORCYCLE",
          entityId: existingMoto.id,
          entityName: data.modelo,
          oldValue: sanitizeForAudit(existingMoto),
          newValue: sanitizeForAudit(updated),
        });
      } else {
        const moto = await createMotorcycle({
          chassis: data.chassi,
          model: data.modelo,
          arrivalDate: data.motoChegou ? data.dataChegada : null,
          registrationStatus: mapStatusRegistro(data.statusRegistro),
          registrationStatusDate: data.dataEmplacamento,
          clientId: client.id,
        });

        await createAuditLog({
          userId: user.id,
          userName: user.name,
          action: "CREATE",
          entityType: "MOTORCYCLE",
          entityId: moto.id,
          entityName: moto.model,
          newValue: sanitizeForAudit(moto),
        });
      }
    }

    revalidatePath("/bdc");
    redirect("/bdc");
  } catch {
    return { success: false, error: "Erro ao salvar cliente." };
  }
}

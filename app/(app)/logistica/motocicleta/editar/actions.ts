"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/app/data/require-user";
import {
  getMotorcycleById as dalGetMotorcycleById,
  getMotorcycleByChassis,
  updateMotorcycle as dalUpdateMotorcycle,
} from "@/lib/data/motorcycle";
import { createAuditLog } from "@/lib/data/audit-log";
import { sanitizeForAudit } from "@/lib/utils";
import { motorcycleSchema } from "@/validators/motorcycle-schema";

export async function getMotorcycleByIdAction(id: string) {
  await requireAuth();
  return dalGetMotorcycleById(id);
}

export async function updateMotorcycleAction(id: string, data: unknown) {
  const user = await requireAuth();

  const parsed = motorcycleSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const formData = parsed.data;

  try {
    const existing = await getMotorcycleByChassis(formData.chassis);
    if (existing && existing.id !== id) {
      return {
        success: false,
        error: "Este chassi já está em uso por outra motocicleta.",
      };
    }

    const oldMoto = await dalGetMotorcycleById(id);
    const updatedMoto = await dalUpdateMotorcycle(id, {
      chassis: formData.chassis,
      model: formData.model,
      arrivalDate: formData.arrivalDate ?? null,
    });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: "UPDATE",
      entityType: "MOTORCYCLE",
      entityId: id,
      entityName: updatedMoto.model,
      oldValue: sanitizeForAudit(oldMoto),
      newValue: sanitizeForAudit(updatedMoto),
    });

    revalidatePath("/logistica");
    redirect("/logistica");
  } catch {
    return { success: false, error: "Erro ao atualizar motocicleta." };
  }
}

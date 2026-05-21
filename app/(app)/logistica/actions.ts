"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/require-user";
import {
  deleteMotorcycle as dalDeleteMotorcycle,
  getAllMotorcycles as dalGetAllMotorcycles,
  getMotorcycleById as dalGetMotorcycleById,
} from "@/lib/data/motorcycle";
import { createAuditLog } from "@/lib/data/audit-log";
import { sanitizeForAudit } from "@/lib/utils";

export async function getMotorcyclesAction() {
  await requireAuth();
  return dalGetAllMotorcycles();
}

export async function deleteMotorcycleAction(id: string) {
  const user = await requireAuth();

  try {
    const moto = await dalGetMotorcycleById(id);
    await dalDeleteMotorcycle(id);

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: "DELETE",
      entityType: "MOTORCYCLE",
      entityId: id,
      entityName: moto?.model,
      oldValue: sanitizeForAudit(moto),
    });

    revalidatePath("/logistica");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao remover motocicleta." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/app/data/require-user";
import { createMotorcycle as dalCreateMotorcycle } from "@/lib/data/motorcycle";
import { createAuditLog } from "@/lib/data/audit-log";
import { sanitizeForAudit } from "@/lib/utils";
import { motorcycleSchema } from "@/validators/motorcycle-schema";

export async function createMotorcycleAction(data: unknown) {
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
    const moto = await dalCreateMotorcycle({
      chassis: formData.chassis,
      model: formData.model,
      arrivalDate: formData.arrivalDate ?? null,
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

    revalidatePath("/logistica");
    redirect("/logistica");
  } catch {
    return { success: false, error: "Erro ao salvar motocicleta." };
  }
}

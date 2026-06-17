"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/require-auth";
import {
  updateMotorcycle as dalUpdateMotorcycle,
  getMotorcycleByChassis,
} from "@/lib/data/motorcycle";
import { motorcycleSchema } from "@/validators/motorcycle-schema";

export async function updateMotorcycleAction(id: string, data: unknown) {
  await requireAuth();

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

    await dalUpdateMotorcycle(id, {
      chassis: formData.chassis,
      model: formData.model,
      forecastDate: formData.forecastDate ?? null,
    });

    revalidatePath("/estoque");
    revalidatePath("/bdc");

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar motocicleta." };
  }
}

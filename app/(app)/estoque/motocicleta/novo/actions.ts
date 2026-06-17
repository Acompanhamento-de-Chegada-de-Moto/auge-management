"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/require-auth";
import {
  createMotorcycle as dalCreateMotorcycle,
  getMotorcycleByChassis,
} from "@/lib/data/motorcycle";
import { motorcycleSchema } from "@/validators/motorcycle-schema";

export async function createMotorcycleAction(data: unknown) {
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

  const existing = await getMotorcycleByChassis(formData.chassis);
  if (existing) {
    return { success: false, error: "Este chassi já está cadastrado." };
  }

  try {
    await dalCreateMotorcycle({
      chassis: formData.chassis,
      model: formData.model,
      forecastDate: formData.forecastDate ?? null,
    });

    revalidatePath("/estoque");
    revalidatePath("/bdc");

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao salvar motocicleta." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { updateMotorcycleSafely } from "@/lib/data/motorcycle";
import type { ApiResponse } from "@/lib/types";
import {
  type CreateMotorcycleType,
  createMotorcycleSchema,
} from "@/lib/zod-schemas/motorcycle-schema";

export async function EditMotorcycleAction(
  id: string,
  values: CreateMotorcycleType,
): Promise<ApiResponse> {
  await requireAuth();

  const parsed = createMotorcycleSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ?? "Dados do formulário inválidos.",
    };
  }

  try {
    const { chassi, model, forecastArrival, forecastArrivalStatus } =
      parsed.data;
    const error = await updateMotorcycleSafely(id, {
      chassi: chassi.trim().toUpperCase(),
      model: model.trim(),
      forecastArrival,
      forecastArrivalStatus,
    });
    if (error) return { status: "error", message: error };

    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return {
      status: "success",
      message: "Motocicleta atualizada com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao editar motocicleta:", error);
    return {
      status: "error",
      message: "Erro interno ao atualizar os dados da motocicleta.",
    };
  }
}

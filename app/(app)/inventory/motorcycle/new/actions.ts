"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { createMotorcycle } from "@/lib/data/motorcycle";
import type { ApiResponse } from "@/lib/types";
import {
  type CreateMotorcycleType,
  createMotorcycleSchema,
} from "@/lib/zod-schemas/motorcycle-schema";

export async function CreateMotorcycleAction(
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
    const data = parsed.data;
    await createMotorcycle({
      chassi: data.chassi.trim().toUpperCase(),
      model: data.model.trim(),
      forecastArrival: data.forecastArrival ?? null,
      forecastArrivalStatus: data.forecastArrivalStatus,
      registrationStatus: data.registrationStatus ?? undefined,
      registrationDate: data.registrationDate ?? null,
      clientId: data.clientId ?? undefined,
    });

    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return {
      status: "success",
      message: "Motocicleta cadastrada com sucesso no estoque.",
    };
  } catch (error) {
    console.error("Erro ao cadastrar motocicleta:", error);
    return {
      status: "error",
      message:
        error instanceof Error && error.message.includes("Unique constraint")
          ? "Já existe uma motocicleta cadastrada com este chassi."
          : "Erro interno ao cadastrar motocicleta.",
    };
  }
}

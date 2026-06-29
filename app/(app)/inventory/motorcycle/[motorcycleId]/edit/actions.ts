"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/app/data/user/require-auth";
import {
  getMotorcycleByIdWithClient,
  updateMotorcycle,
  getMotorcycleByChassis,
} from "@/lib/data/motorcycle";
import type { ApiResponse } from "@/lib/types";
import type { ArrivalStatus } from "@/generated/prisma/enums";
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
      message: "Dados do formulário inválidos.",
    };
  }

  try {
    const { chassi, model, forecastArrival, forecastArrivalStatus } = parsed.data;

    if (!chassi || !model) {
      return {
        status: "error",
        message: "Chassi e modelo são obrigatórios.",
      };
    }

    const currentMotorcycle = await getMotorcycleByIdWithClient(id);

    if (!currentMotorcycle) {
      return {
        status: "error",
        message: "Motocicleta não encontrada.",
      };
    }

    if (chassi !== currentMotorcycle.chassi) {
      const chassiExists = await getMotorcycleByChassis(chassi);

      if (chassiExists) {
        return {
          status: "error",
          message: "Este chassi já está cadastrado em outra motocicleta.",
        };
      }
    }

    await updateMotorcycle(id, {
      chassi,
      model,
      forecastArrival: forecastArrival ?? null,
      forecastArrivalStatus: (forecastArrivalStatus ?? "NO_INFORMATION") as ArrivalStatus,
    });

    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
  } catch (error) {
    console.error("Erro ao editar motocicleta:", error);

    return {
      status: "error",
      message: "Erro interno ao atualizar os dados da motocicleta.",
    };
  }

  redirect("/inventory");
}

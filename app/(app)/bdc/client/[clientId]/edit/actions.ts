"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { prisma } from "@/lib/db";
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

  try {
    const validation = createMotorcycleSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: "error",
        message: "Dados do formulário inválidos.",
      };
    }

    const { chassi, model, forecastArrival } = validation.data;

    const currentMotorcycle = await prisma.motorcycle.findUnique({
      where: { id },
    });

    if (!currentMotorcycle) {
      return {
        status: "error",
        message: "Motocicleta não encontrada.",
      };
    }

    if (chassi !== currentMotorcycle.chassi) {
      const chassiExists = await prisma.motorcycle.findUnique({
        where: { chassi },
      });

      if (chassiExists) {
        return {
          status: "error",
          message: "Este chassi já está cadastrado em outra motocicleta.",
        };
      }
    }

    await prisma.motorcycle.update({
      where: { id },
      data: {
        chassi,
        model,
        forecastArrival: forecastArrival ?? null,
      },
    });

    revalidatePath("/inventory");

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

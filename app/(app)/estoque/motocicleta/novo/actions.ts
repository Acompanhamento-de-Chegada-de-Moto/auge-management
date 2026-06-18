"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";
import type { ArrivalStatus, RegistrationStatus } from "@/generated/prisma/enums";
import {
  type CreateMotorcycleType,
  createMotorcycleSchema,
} from "@/lib/zod-schemas/motorcycle-schema";

export async function CreateMotorcycleAction(
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

    const {
      chassi,
      model,
      forecastArrival,
      forecastArrivalStatus,
      registrationStatus,
      registrationDate,
      clientId,
    } = validation.data;

    const existingMotorcycle = await prisma.motorcycle.findUnique({
      where: { chassi },
    });

    if (existingMotorcycle) {
      return {
        status: "error",
        message: "Já existe uma motocicleta cadastrada com este chassi.",
      };
    }

    await prisma.motorcycle.create({
      data: {
        chassi,
        model,
        forecastArrival: forecastArrival ?? null,
        forecastArrivalStatus: forecastArrivalStatus as ArrivalStatus,
        registrationStatus: (registrationStatus as RegistrationStatus | null) ?? null,
        registrationDate: registrationDate ?? null,
        clientId: clientId ?? null,
      },
    });

    revalidatePath("/estoque");

    return {
      status: "success",
      message: "Motocicleta cadastrada com sucesso no estoque.",
    };
  } catch (error) {
    console.error("Erro ao cadastrar motocicleta:", error);

    return {
      status: "error",
      message: "Erro interno ao cadastrar motocicleta.",
    };
  }
}

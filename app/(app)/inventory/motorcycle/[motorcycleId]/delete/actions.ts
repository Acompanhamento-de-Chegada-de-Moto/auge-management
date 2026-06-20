"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

export async function DeleteMotorcycleAction(
  motorcycleId: string,
): Promise<ApiResponse> {
  await requireAuth();

  try {
    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id: motorcycleId },
    });

    if (!motorcycle) {
      return {
        status: "error",
        message: "Motocicleta não encontrada no sistema.",
      };
    }

    // Remove do banco de dados
    await prisma.motorcycle.delete({
      where: {
        id: motorcycleId,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");

    return {
      status: "success",
      message: "Motocicleta deletada com sucesso do estoque.",
    };
  } catch (error) {
    console.error("Erro ao deletar motocicleta:", error);
    return {
      status: "error",
      message: "Ocorreu um erro ao tentar deletar a motocicleta.",
    };
  }
}

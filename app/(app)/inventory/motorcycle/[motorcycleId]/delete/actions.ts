"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { deleteMotorcycle, getMotorcycleById } from "@/lib/data/motorcycle";
import type { ApiResponse } from "@/lib/types";

export async function DeleteMotorcycleAction(
  motorcycleId: string,
): Promise<ApiResponse> {
  await requireAuth();

  try {
    const motorcycle = await getMotorcycleById(motorcycleId);

    if (!motorcycle) {
      return {
        status: "error",
        message: "Motocicleta não encontrada no sistema.",
      };
    }

    await deleteMotorcycle(motorcycleId);

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

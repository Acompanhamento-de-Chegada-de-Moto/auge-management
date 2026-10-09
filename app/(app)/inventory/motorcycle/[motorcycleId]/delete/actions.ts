"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { deleteMotorcycle } from "@/lib/data/motorcycle";
import type { ApiResponse } from "@/lib/types";

export async function DeleteMotorcycleAction(
  motorcycleId: string,
): Promise<ApiResponse> {
  await requireAuth();

  try {
    const result = await deleteMotorcycle(motorcycleId);

    if (result.count === 0) {
      return {
        status: "error",
        message: "Motocicleta não encontrada no sistema.",
      };
    }

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

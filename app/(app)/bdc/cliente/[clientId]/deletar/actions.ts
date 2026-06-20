"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

export async function DeleteClientAction(
  clientId: string,
): Promise<ApiResponse> {
  await requireAuth();

  try {
    await prisma.client.delete({
      where: {
        id: clientId,
      },
    });

    revalidatePath("/bdc");
    revalidatePath("/acompanhamento", "layout");

    return {
      status: "success",
      message: "Cliente deletado com sucesso do sistema.",
    };
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    return {
      status: "error",
      message: "Ocorreu um erro ao tentar deletar o cliente.",
    };
  }
}

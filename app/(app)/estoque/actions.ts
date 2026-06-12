"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/require-user";
import {
  deleteMotorcycle as dalDeleteMotorcycle,
  getAllMotorcycles as dalGetAllMotorcycles,
  getMotorcycleById as dalGetMotorcycleById,
} from "@/lib/data/motorcycle";

export async function getMotorcyclesAction() {
  await requireAuth();
  return dalGetAllMotorcycles();
}

export async function deleteMotorcycleAction(id: string) {
  await requireAuth();

  try {
    await dalDeleteMotorcycle(id);

    revalidatePath("/estoque");
    revalidatePath("/bdc");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao remover motocicleta." };
  }
}

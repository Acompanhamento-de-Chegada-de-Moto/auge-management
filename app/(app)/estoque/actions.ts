"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/require-user";
import {
  deleteMotorcycle as dalDeleteMotorcycle,
  getAllMotorcycles as dalGetAllMotorcycles,
  getMotorcycleById as dalGetMotorcycleById,
  getEstoqueFilterOptions as dalGetEstoqueFilterOptions,
  getMotorcyclesPaginated as dalGetMotorcyclesPaginated,
} from "@/lib/data/motorcycle";

export async function getMotorcyclesAction() {
  await requireAuth();
  return dalGetAllMotorcycles();
}

export async function getEstoqueFilterOptionsAction() {
  await requireAuth();
  return dalGetEstoqueFilterOptions();
}

export async function getMotorcyclesPaginatedAction(params: {
  page: number;
  pageSize: number;
  model?: string;
  status?: "Em Trânsito" | "Chegou" | "Atrasada";
  chassisSearch?: string;
}) {
  await requireAuth();
  return dalGetMotorcyclesPaginated(params);
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

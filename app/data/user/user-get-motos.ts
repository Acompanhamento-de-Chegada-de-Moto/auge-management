import "server-only";

import { requireAuth } from "../require-auth";
import {
  getMotorcyclesPaginated as dalGetMotorcyclesPaginated,
  getEstoqueFilterOptions as dalGetFilterOptions,
} from "@/lib/data/motorcycle";

export async function userGetMotorcyclesPaginated(params: {
  page: number;
  pageSize: number;
  model?: string;
  status?: "Em Trânsito" | "Chegou" | "Atrasada";
  chassisSearch?: string;
}) {
  await requireAuth();

  return dalGetMotorcyclesPaginated(params);
}

export async function userGetEstoqueFilterOptions() {
  await requireAuth();

  return dalGetFilterOptions();
}

export type UserGetMotorcyclesPaginatedType = Awaited<
  ReturnType<typeof userGetMotorcyclesPaginated>
>;
export type UserGetEstoqueFilterOptionsType = Awaited<
  ReturnType<typeof userGetEstoqueFilterOptions>
>;

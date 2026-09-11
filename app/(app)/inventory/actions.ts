"use server";

import { requireAuth } from "@/app/data/user/require-auth";
import {
  getEstoqueFilterOptions,
  getMotorcyclesPaginated,
} from "@/lib/data/motorcycle";

export async function getMotorcyclesPaginatedAction(params: {
  page: number;
  pageSize?: number;
  model?: string;
  status?: string;
  chassisSearch?: string;
  arrived?: "true" | "false";
}) {
  await requireAuth();

  const pageSize = params.pageSize ?? 10;

  const [filterOptions, paginated] = await Promise.all([
    getEstoqueFilterOptions(),
    getMotorcyclesPaginated({
      page: params.page,
      pageSize,
      model: params.model,
      status: params.status as
        | "Em Trânsito"
        | "Chegou"
        | "Atrasada"
        | undefined,
      chassisSearch: params.chassisSearch,
      arrived: params.arrived,
    }),
  ]);

  return {
    rows: paginated.motorcycles,
    total: paginated.total,
    totalPages: paginated.totalPages,
    page: params.page,
    filterOptions,
  };
}

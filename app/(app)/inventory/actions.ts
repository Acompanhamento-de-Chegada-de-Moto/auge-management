"use server";

import { requireAuth } from "@/app/data/user/require-auth";
import { getMotorcycleByIdWithClient, getMotorcyclesPaginated } from "@/lib/data/motorcycle";
import { prisma } from "@/lib/db";

export async function getMotorcycleByIdAction(id: string) {
  await requireAuth();
  return getMotorcycleByIdWithClient(id);
}

export async function getMotorcyclesPaginatedAction(params: {
  page: number;
  pageSize?: number;
  model?: string;
  status?: string;
}) {
  await requireAuth();

  const pageSize = params.pageSize ?? 10;

  const [modelsResult, paginated] = await Promise.all([
    prisma.motorcycle.findMany({
      select: { model: true },
      distinct: ["model"],
      where: { model: { not: "" } },
      orderBy: { model: "asc" },
    }),
    getMotorcyclesPaginated({
      page: params.page,
      pageSize,
      model: params.model,
      status: params.status as "Em Trânsito" | "Chegou" | "Atrasada" | undefined,
    }),
  ]);

  return {
    rows: paginated.motorcycles,
    total: paginated.total,
    totalPages: paginated.totalPages,
    page: params.page,
    filterOptions: {
      models: modelsResult.map((m) => m.model),
    },
  };
}

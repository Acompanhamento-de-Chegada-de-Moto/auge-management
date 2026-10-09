"use server";

import { requireAuth } from "@/app/data/user/require-auth";
import {
  getEstoqueFilterOptions,
  getMotorcycleStatusCounts,
  getMotorcyclesPaginated,
} from "@/lib/data/motorcycle";

const arrivalFilters = ["in-transit", "arrived", "delayed"] as const;

export async function getMotorcyclesPaginatedAction(params: {
  page: number;
  pageSize?: number;
  model?: string;
  status?: string;
  chassisSearch?: string;
  arrived?: "true" | "false";
}) {
  await requireAuth();

  const page = Number.isFinite(params.page)
    ? Math.max(1, Math.floor(params.page))
    : 1;
  const pageSize = Math.min(
    100,
    Math.max(1, Math.floor(params.pageSize ?? 10)),
  );
  const status = arrivalFilters.find((value) => value === params.status);

  const [filterOptions, statusCounts, paginated] = await Promise.all([
    getEstoqueFilterOptions(),
    getMotorcycleStatusCounts(),
    getMotorcyclesPaginated({
      page,
      pageSize,
      model: params.model?.trim() || undefined,
      status,
      chassisSearch: params.chassisSearch?.trim() || undefined,
      arrived: params.arrived,
    }),
  ]);

  return {
    rows: paginated.motorcycles,
    total: paginated.total,
    totalPages: paginated.totalPages,
    page,
    statusCounts,
    filterOptions,
  };
}

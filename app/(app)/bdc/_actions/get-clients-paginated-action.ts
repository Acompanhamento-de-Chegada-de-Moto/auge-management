"use server";

import { requireAuth } from "@/app/data/user/require-auth";
import { getBDCFilterOptions, getClientsPaginated } from "@/lib/data/client";
import { mapClientsToRows } from "../_lib/client-mapper";
import type { GetClientsPaginatedParams, PaginatedResult } from "../_lib/types";

export async function getClientsPaginatedAction(
  params: GetClientsPaginatedParams,
): Promise<PaginatedResult> {
  await requireAuth();

  const page = Math.max(1, Math.floor(params.page));
  const pageSize = Math.min(
    100,
    Math.max(1, Math.floor(params.pageSize ?? 10)),
  );

  const [paginated, filterOptions] = await Promise.all([
    getClientsPaginated({
      page,
      pageSize,
      sellerName: params.sellerName,
      city: params.city,
      model: params.model,
      search: params.search,
      arrived: params.arrived,
    }),
    getBDCFilterOptions(),
  ]);

  return {
    rows: mapClientsToRows(paginated.clients),
    totalClients: paginated.total,
    totalPages: paginated.totalPages,
    page,
    filterOptions: {
      sellers: filterOptions.sellers,
      cities: filterOptions.cities,
      models: filterOptions.models,
    },
  };
}

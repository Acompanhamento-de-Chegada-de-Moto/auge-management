import "server-only";

import {
  getBDCFilterOptions,
  getBDCStatusCounts,
  getClientsPaginated,
} from "@/lib/data/client";
import {
  getEstoqueFilterOptions,
  getMotorcycleStatusCounts,
  getMotorcyclesPaginated,
} from "@/lib/data/motorcycle";
import { requireAuth } from "./require-auth";

export async function getBdcListing(
  params: Parameters<typeof getClientsPaginated>[0],
) {
  await requireAuth();
  const [paginated, filterOptions, statusCounts] = await Promise.all([
    getClientsPaginated(params),
    getBDCFilterOptions(),
    getBDCStatusCounts(),
  ]);
  return { paginated, filterOptions, statusCounts };
}

export async function getInventoryListing(
  params: Parameters<typeof getMotorcyclesPaginated>[0],
) {
  await requireAuth();
  const [paginated, filterOptions, statusCounts] = await Promise.all([
    getMotorcyclesPaginated(params),
    getEstoqueFilterOptions(),
    getMotorcycleStatusCounts(),
  ]);
  return { paginated, filterOptions, statusCounts };
}

import "server-only";

import { notFound } from "next/navigation";
import { requireAuth } from "../require-auth";
import {
  getClientsPaginated as dalGetClientsPaginated,
  getBDCFilterOptions as dalGetFilterOptions,
} from "@/lib/data/client";

export async function userGetClientsPaginated(params: {
  page: number;
  pageSize: number;
  sellerName?: string;
  city?: string;
  model?: string;
  search?: string;
}) {
  await requireAuth();

  return dalGetClientsPaginated(params);
}

export async function userGetFilterOptions() {
  await requireAuth();

  return dalGetFilterOptions();
}

export type UserGetClientsPaginatedType = Awaited<
  ReturnType<typeof userGetClientsPaginated>
>;
export type UserGetFilterOptionsType = Awaited<
  ReturnType<typeof userGetFilterOptions>
>;

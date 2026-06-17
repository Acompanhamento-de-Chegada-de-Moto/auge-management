import "server-only";

import { notFound } from "next/navigation";
import { requireAuth } from "../require-auth";
import { getClientById as dalGetClientById } from "@/lib/data/client";

export async function userGetClientById(id: string) {
  await requireAuth();

  const data = await dalGetClientById(id);

  if (!data) {
    notFound();
  }

  return data;
}

export type UserGetClientByIdType = Awaited<ReturnType<typeof userGetClientById>>;

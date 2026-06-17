import "server-only";

import { notFound } from "next/navigation";
import { requireAuth } from "../require-auth";
import { getMotorcycleById as dalGetMotorcycleById } from "@/lib/data/motorcycle";

export async function userGetMotorcycleById(id: string) {
  await requireAuth();

  const data = await dalGetMotorcycleById(id);

  if (!data) {
    notFound();
  }

  return data;
}

export type UserGetMotorcycleByIdType = Awaited<
  ReturnType<typeof userGetMotorcycleById>
>;

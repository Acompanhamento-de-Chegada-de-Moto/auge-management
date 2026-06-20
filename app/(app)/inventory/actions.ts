"use server";

import { requireAuth } from "@/app/data/user/require-auth";
import { getMotorcycleByIdWithClient } from "@/lib/data/motorcycle";

export async function getMotorcycleByIdAction(id: string) {
  await requireAuth();
  return getMotorcycleByIdWithClient(id);
}

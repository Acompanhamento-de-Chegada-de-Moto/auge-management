import "server-only";

import { getPublicMotorcycleById } from "@/lib/data/motorcycle";

export async function publicGetMotorcycleById(id: string) {
  return getPublicMotorcycleById(id);
}

export type PublicGetMotorcycleByIdType = Awaited<
  ReturnType<typeof publicGetMotorcycleById>
>;

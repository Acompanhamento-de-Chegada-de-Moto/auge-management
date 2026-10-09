"use server";

import { getMotorcycleByChassisWithClient } from "@/lib/data/motorcycle";
import { requireAuth } from "./require-auth";

export async function userGetMotorcycle(chassis: string) {
  await requireAuth();
  return getMotorcycleByChassisWithClient(chassis.trim().toUpperCase());
}

export type UserGetMotorcycleType = Awaited<
  ReturnType<typeof userGetMotorcycle>
>;

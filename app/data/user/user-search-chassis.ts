import "server-only";

import { requireAuth } from "../require-auth";
import { getMotorcycleByChassis } from "@/lib/data/motorcycle";

export async function userSearchChassis(chassis: string) {
  await requireAuth();

  return getMotorcycleByChassis(chassis);
}

export type UserSearchChassisType = Awaited<ReturnType<typeof userSearchChassis>>;

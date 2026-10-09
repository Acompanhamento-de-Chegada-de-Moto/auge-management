import "server-only";

import { getAdminUsers } from "@/lib/data/user";
import { requireAdmin } from "./require-admin";

export async function adminGetUsers() {
  await requireAdmin();
  return getAdminUsers();
}

export type AdminGetUsersType = Awaited<
  ReturnType<typeof adminGetUsers>
>[number];

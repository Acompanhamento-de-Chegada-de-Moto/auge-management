import "server-only";

import { requireAdmin } from "../require-admin";
import { prisma } from "@/lib/db";

export async function adminGetUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export type AdminGetUsersType = Awaited<ReturnType<typeof adminGetUsers>>;

import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      banned: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export type AdminGetUsersType = Awaited<
  ReturnType<typeof adminGetUsers>
>[number];

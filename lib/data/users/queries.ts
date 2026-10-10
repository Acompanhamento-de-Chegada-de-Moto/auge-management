import "server-only";

import { prisma } from "@/lib/db";

export async function getAdminUsers() {
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

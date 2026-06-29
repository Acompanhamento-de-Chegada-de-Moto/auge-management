import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { requireManager } from "./require-manager";

const ticketInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
  },
  messages: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export async function adminGetAllTickets() {
  await requireAdmin();

  return prisma.ticket.findMany({
    include: ticketInclude,
    orderBy: { createdAt: "desc" },
  });
}

export type AdminTicket = Awaited<
  ReturnType<typeof adminGetAllTickets>
>[number];

export async function managerGetOwnTickets(userId: string) {
  await requireManager();

  return prisma.ticket.findMany({
    where: { createdById: userId },
    include: ticketInclude,
    orderBy: { createdAt: "desc" },
  });
}

export type ManagerTicket = Awaited<
  ReturnType<typeof managerGetOwnTickets>
>[number];

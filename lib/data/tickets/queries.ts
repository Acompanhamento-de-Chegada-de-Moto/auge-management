import { prisma } from "@/lib/db";

const ticketInclude = {
  createdBy: {
    select: { id: true, name: true, email: true, role: true, image: true },
  },
  messages: {
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export async function getAllTickets() {
  return prisma.ticket.findMany({
    include: ticketInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getTicketsByCreator(userId: string) {
  return prisma.ticket.findMany({
    where: { createdById: userId },
    include: ticketInclude,
    orderBy: { createdAt: "desc" },
  });
}

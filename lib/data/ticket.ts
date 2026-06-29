import { prisma } from "@/lib/db";

export async function createTicket(data: {
  subject: string;
  description: string;
  priority: string;
  createdById: string;
}) {
  return prisma.ticket.create({
    data: {
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      status: "OPEN",
      createdById: data.createdById,
    },
  });
}

export async function getTicketsByUser(userId: string) {
  return prisma.ticket.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllTickets() {
  return prisma.ticket.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTicketById(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function updateTicketStatus(id: string, status: string) {
  return prisma.ticket.update({
    where: { id },
    data: { status },
  });
}

export async function createTicketMessage(data: {
  ticketId: string;
  userId: string;
  message: string;
}) {
  return prisma.ticketMessage.create({
    data: {
      ticketId: data.ticketId,
      userId: data.userId,
      message: data.message,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function getTicketMessages(ticketId: string) {
  return prisma.ticketMessage.findMany({
    where: { ticketId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

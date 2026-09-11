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

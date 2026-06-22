"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { createTicket, createTicketMessage, updateTicketStatus } from "@/lib/data/ticket";
import {
  type CreateTicketInput,
  createTicketSchema,
} from "@/validators/create-ticket-schema";

export async function createTicketAction(data: CreateTicketInput) {
  const { user } = await requireAuth();

  const parsed = createTicketSchema.safeParse(data);
  if (!parsed.success) {
    return {
      status: "error" as const,
      message: "Dados do formulário inválidos.",
    };
  }

  try {
    await createTicket({
      subject: parsed.data.subject,
      description: parsed.data.description,
      priority: parsed.data.priority,
      createdById: user.id,
    });

    revalidatePath("/support");

    return {
      status: "success" as const,
      message: "Ticket criado com sucesso.",
    };
  } catch (error) {
    console.error("[createTicket] Erro ao criar ticket:", error);

    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Erro interno ao criar ticket.",
    };
  }
}

export async function addTicketMessageAction(
  ticketId: string,
  message: string,
) {
  const { user } = await requireAuth();

  if (!message.trim()) {
    return {
      status: "error" as const,
      message: "Mensagem não pode estar vazia.",
    };
  }

  try {
    await createTicketMessage({
      ticketId,
      userId: user.id,
      message: message.trim(),
    });

    revalidatePath("/support");

    return {
      status: "success" as const,
      message: "Resposta enviada.",
    };
  } catch (error) {
    console.error("[addTicketMessage] Erro ao responder:", error);

    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Erro interno ao enviar resposta.",
    };
  }
}

export async function updateTicketStatusAction(
  ticketId: string,
  status: string,
) {
  await requireAdmin();

  try {
    await updateTicketStatus(ticketId, status);

    revalidatePath("/support");

    return {
      status: "success" as const,
      message: "Status do ticket atualizado.",
    };
  } catch (error) {
    console.error("[updateTicketStatus] Erro ao atualizar status:", error);

    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Erro interno ao atualizar status.",
    };
  }
}

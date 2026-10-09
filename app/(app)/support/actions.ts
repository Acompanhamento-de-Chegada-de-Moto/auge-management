"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { requireAuth } from "@/app/data/user/require-auth";
import {
  createTicket,
  createTicketMessage,
  updateTicketStatus,
} from "@/lib/data/ticket";
import {
  type CreateTicketInput,
  createTicketSchema,
} from "@/validators/create-ticket-schema";

const messageSchema = z
  .string()
  .trim()
  .min(1, "Mensagem não pode estar vazia.")
  .max(2000);
const ticketStatusSchema = z.enum(["IN_PROGRESS", "RESOLVED", "CLOSED"]);

function getActionError(error: unknown, fallback: string) {
  console.error("[support-action] Operação não concluída:", error);
  return {
    status: "error" as const,
    message: error instanceof Error ? error.message : fallback,
  };
}

export async function createTicketAction(data: CreateTicketInput) {
  const { user } = await requireAuth();
  const parsed = createTicketSchema.safeParse(data);
  if (!parsed.success) {
    return {
      status: "error" as const,
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    await createTicket({ ...parsed.data, createdById: user.id });
    revalidatePath("/support");
    return {
      status: "success" as const,
      message: "Ticket criado com sucesso.",
    };
  } catch (error) {
    return getActionError(error, "Erro interno ao criar ticket.");
  }
}

export async function addTicketMessageAction(
  ticketId: string,
  message: string,
) {
  const { user } = await requireAuth();
  const parsed = messageSchema.safeParse(message);
  if (!parsed.success) {
    return {
      status: "error" as const,
      message: parsed.error.issues[0]?.message ?? "Mensagem inválida.",
    };
  }

  try {
    await createTicketMessage({
      ticketId,
      userId: user.id,
      message: parsed.data,
    });
    revalidatePath("/support");
    return { status: "success" as const, message: "Resposta enviada." };
  } catch (error) {
    return getActionError(error, "Erro interno ao enviar resposta.");
  }
}

export async function updateTicketStatusAction(
  ticketId: string,
  status: string,
) {
  await requireAdmin();
  const parsed = ticketStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { status: "error" as const, message: "Status de ticket inválido." };
  }

  try {
    await updateTicketStatus(ticketId, parsed.data);
    revalidatePath("/support");
    return {
      status: "success" as const,
      message: "Status do ticket atualizado.",
    };
  } catch (error) {
    return getActionError(error, "Erro interno ao atualizar status.");
  }
}

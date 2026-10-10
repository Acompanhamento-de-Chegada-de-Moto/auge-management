import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createTicketMessage,
  getTicketOwnerId,
  updateTicketStatus,
} from "@/lib/data/ticket";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";

import { replyTicketSchema } from "@/validators/reply-ticket-schema";

const statusSchema = z.object({
  status: z.enum(["IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

export async function changeTicketStatus(
  input: unknown,
  _actor: MutationActor,
  ticketId: string,
): Promise<MutationResult> {
  if (!z.string().uuid().safeParse(ticketId).success)
    return mutationError("ID inválido.", 400);

  try {
    const parsed = statusSchema.safeParse(input);
    if (!parsed.success)
      return mutationError("Status de ticket inválido.", 400);
    await updateTicketStatus(ticketId, parsed.data.status);
    revalidatePath("/support");
    return mutationSuccess({ message: "Status do ticket atualizado." });
  } catch (error) {
    console.error(
      "[service/support/tickets/:ticketId] Falha ao atualizar:",
      error,
    );
    return mutationError("Erro interno ao atualizar ticket.", 500);
  }
}

export async function replyToTicket(
  input: unknown,
  actor: MutationActor,
  ticketId: string,
): Promise<MutationResult> {
  if (!z.string().uuid().safeParse(ticketId).success)
    return mutationError("ID inválido.", 400);

  try {
    const body = replyTicketSchema.safeParse(input);
    if (!body.success)
      return mutationError(
        body.error.issues[0]?.message ?? "Mensagem inválida.",
        400,
      );

    const ticket = await getTicketOwnerId(ticketId);
    if (!ticket) return mutationError("Ticket não encontrado.", 404);
    if (ticket.createdById !== actor.user.id && actor.user.role !== "ADMIN") {
      return mutationError("Acesso negado.", 403);
    }

    await createTicketMessage({
      ticketId,
      userId: actor.user.id,
      message: body.data.message,
    });
    revalidatePath("/support");
    return mutationSuccess({ message: "Resposta enviada." }, { status: 201 });
  } catch (error) {
    console.error(
      "[service/support/tickets/:ticketId] Falha ao enviar mensagem:",
      error,
    );
    return mutationError("Erro interno ao enviar a mensagem.", 500);
  }
}

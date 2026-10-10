import "server-only";
import { revalidatePath } from "next/cache";
import { createTicket } from "@/lib/data/ticket";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { createTicketSchema } from "@/validators/create-ticket-schema";

export async function openTicket(
  input: unknown,
  actor: MutationActor,
): Promise<MutationResult> {
  try {
    const parsed = createTicketSchema.safeParse(input);
    if (!parsed.success)
      return mutationError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    const ticket = await createTicket({
      ...parsed.data,
      createdById: actor.user.id,
    });
    revalidatePath("/support");
    return mutationSuccess(
      { message: "Ticket criado com sucesso.", data: { id: ticket.id } },
      { status: 201 },
    );
  } catch (error) {
    console.error("[service/support/tickets] Falha ao criar:", error);
    return mutationError("Erro interno ao criar ticket.", 500);
  }
}

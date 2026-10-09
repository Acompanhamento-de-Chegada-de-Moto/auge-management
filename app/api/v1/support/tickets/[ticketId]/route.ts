import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  authorizeApiRequest,
  assertSameOrigin,
  apiError,
  readJsonBody,
} from "@/lib/api/auth";
import {
  createTicketMessage,
  getTicketOwnerId,
  updateTicketStatus,
} from "@/lib/data/ticket";

type RouteContext = { params: Promise<{ ticketId: string }> };
const statusSchema = z.object({
  status: z.enum(["IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

export async function PATCH(request: Request, { params }: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request, ["ADMIN"]);
  if (authorization.response) return authorization.response;

  const { ticketId } = await params;
  if (!z.string().uuid().safeParse(ticketId).success)
    return apiError("ID inválido.", 400);

  try {
    const parsed = statusSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return apiError("Status de ticket inválido.", 400);
    await updateTicketStatus(ticketId, parsed.data.status);
    revalidatePath("/support");
    return Response.json({ message: "Status do ticket atualizado." });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE")
      return apiError("Requisição muito grande.", 413);
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    console.error(
      "[api/v1/support/tickets/:ticketId] Falha ao atualizar:",
      error,
    );
    return apiError("Erro interno ao atualizar ticket.", 500);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request);
  if (authorization.response) return authorization.response;

  const { ticketId } = await params;
  if (!z.string().uuid().safeParse(ticketId).success)
    return apiError("ID inválido.", 400);

  try {
    const body = z
      .object({ message: z.string().trim().min(1).max(2000) })
      .safeParse(await readJsonBody(request));
    if (!body.success)
      return apiError(
        body.error.issues[0]?.message ?? "Mensagem inválida.",
        400,
      );

    const ticket = await getTicketOwnerId(ticketId);
    if (!ticket) return apiError("Ticket não encontrado.", 404);
    if (
      ticket.createdById !== authorization.session.user.id &&
      authorization.session.user.role !== "ADMIN"
    ) {
      return apiError("Acesso negado.", 403);
    }

    await createTicketMessage({
      ticketId,
      userId: authorization.session.user.id,
      message: body.data.message,
    });
    revalidatePath("/support");
    return Response.json({ message: "Resposta enviada." }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE")
      return apiError("Requisição muito grande.", 413);
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    console.error(
      "[api/v1/support/tickets/:ticketId] Falha ao enviar mensagem:",
      error,
    );
    return apiError("Erro interno ao enviar a mensagem.", 500);
  }
}

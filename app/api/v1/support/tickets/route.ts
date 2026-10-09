import { revalidatePath } from "next/cache";
import {
  authorizeApiRequest,
  assertSameOrigin,
  apiError,
  readJsonBody,
} from "@/lib/api/auth";
import { createTicket } from "@/lib/data/ticket";
import { prisma } from "@/lib/db";
import { createTicketSchema } from "@/validators/create-ticket-schema";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request);
  if (authorization.response) return authorization.response;

  try {
    const parsed = createTicketSchema.safeParse(await readJsonBody(request));
    if (!parsed.success)
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    const ticket = await createTicket({
      ...parsed.data,
      createdById: authorization.session.user.id,
    });
    revalidatePath("/support");
    return Response.json(
      { message: "Ticket criado com sucesso.", data: { id: ticket.id } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE")
      return apiError("Requisição muito grande.", 413);
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    console.error("[api/v1/support/tickets] Falha ao criar:", error);
    return apiError("Erro interno ao criar ticket.", 500);
  }
}

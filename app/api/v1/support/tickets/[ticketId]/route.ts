import { runApiMutation } from "@/lib/server/api-mutation";
import {
  changeTicketStatus,
  replyToTicket,
} from "@/lib/services/support/ticket";

type RouteContext = { params: Promise<{ ticketId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const { ticketId } = await params;
  return runApiMutation(request, {
    roles: ["ADMIN"],
    execute: (input, actor) => changeTicketStatus(input, actor, ticketId),
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { ticketId } = await params;
  return runApiMutation(request, {
    roles: undefined,
    execute: (input, actor) => replyToTicket(input, actor, ticketId),
  });
}

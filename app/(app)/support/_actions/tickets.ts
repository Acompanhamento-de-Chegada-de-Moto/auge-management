"use server";

import { runActionMutation } from "@/lib/server/action-mutation";
import { openTicket } from "@/lib/services/support/create-ticket";
import {
  changeTicketStatus,
  replyToTicket,
} from "@/lib/services/support/ticket";

export async function createTicketAction(input: unknown) {
  return runActionMutation({
    input,
    scope: "/api/v1/support/tickets",
    method: "POST",
    execute: (actor) => openTicket(input, actor),
  });
}

export async function updateTicketStatusAction(id: string, input: unknown) {
  return runActionMutation({
    input,
    scope: "/api/v1/support/tickets/:id",
    method: "PATCH",
    roles: ["ADMIN"],
    execute: (actor) => changeTicketStatus(input, actor, id),
  });
}

export async function replyToTicketAction(id: string, input: unknown) {
  return runActionMutation({
    input,
    scope: "/api/v1/support/tickets/:id",
    method: "POST",
    execute: (actor) => replyToTicket(input, actor, id),
  });
}

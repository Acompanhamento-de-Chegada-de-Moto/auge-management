import { runApiMutation } from "@/lib/server/api-mutation";
import { openTicket } from "@/lib/services/support/create-ticket";

export async function POST(request: Request) {
  return runApiMutation(request, {
    roles: undefined,
    execute: (input, actor) => openTicket(input, actor),
  });
}

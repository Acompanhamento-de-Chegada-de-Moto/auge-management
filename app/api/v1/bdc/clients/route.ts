import { runApiMutation } from "@/lib/server/api-mutation";
import { createClient } from "@/lib/services/bdc/create-client";

export async function POST(request: Request) {
  return runApiMutation(request, {
    roles: undefined,
    execute: (input, actor) => createClient(input, actor),
  });
}

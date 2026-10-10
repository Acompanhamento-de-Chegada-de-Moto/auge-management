import { runApiMutation } from "@/lib/server/api-mutation";
import { createTeamUser } from "@/lib/services/users/create-user";

export async function POST(request: Request) {
  return runApiMutation(request, {
    roles: ["ADMIN"],
    execute: (input, actor) => createTeamUser(input, actor),
  });
}

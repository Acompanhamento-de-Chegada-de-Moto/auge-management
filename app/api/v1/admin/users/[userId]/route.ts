import { runApiMutation } from "@/lib/server/api-mutation";
import { removeTeamUser, updateTeamUser } from "@/lib/services/users/user";

type RouteContext = { params: Promise<{ userId: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const { userId } = await params;
  return runApiMutation(request, {
    roles: ["ADMIN"],
    execute: (input, actor) => updateTeamUser(input, actor, userId),
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { userId } = await params;
  return runApiMutation(request, {
    roles: ["ADMIN"],
    execute: (input, actor) => removeTeamUser(input, actor, userId),
  });
}

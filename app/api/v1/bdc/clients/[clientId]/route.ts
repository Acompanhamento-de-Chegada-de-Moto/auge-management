import { runApiMutation } from "@/lib/server/api-mutation";
import { removeClient, updateClient } from "@/lib/services/bdc/client";

type RouteContext = { params: Promise<{ clientId: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const { clientId } = await params;
  return runApiMutation(request, {
    roles: undefined,
    execute: (input, actor) => updateClient(input, actor, clientId),
  });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { clientId } = await params;
  return runApiMutation(request, {
    roles: undefined,
    execute: (input, actor) => removeClient(input, actor, clientId),
  });
}

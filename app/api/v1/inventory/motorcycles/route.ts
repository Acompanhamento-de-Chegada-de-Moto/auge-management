import { runApiMutation } from "@/lib/server/api-mutation";
import { createInventoryMotorcycle } from "@/lib/services/inventory/create-motorcycle";

export async function POST(request: Request) {
  return runApiMutation(request, {
    roles: undefined,
    execute: (input, actor) => createInventoryMotorcycle(input, actor),
  });
}

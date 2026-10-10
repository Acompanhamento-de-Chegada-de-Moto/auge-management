import { runApiMutation } from "@/lib/server/api-mutation";
import { importInventory } from "@/lib/services/inventory/import";

export async function POST(request: Request) {
  return runApiMutation(request, {
    roles: undefined,
    maxBodyBytes: 5 * 1024 * 1024,
    rateLimit: {
      scope: "inventory-import",
      maxRequests: 3,
      windowSeconds: 600,
    },
    execute: (input, actor) => importInventory(input, actor),
  });
}

import { runApiMutation } from "@/lib/server/api-mutation";
import { importClients } from "@/lib/services/bdc/import";

export async function POST(request: Request) {
  return runApiMutation(request, {
    roles: undefined,
    maxBodyBytes: 5 * 1024 * 1024,
    rateLimit: { scope: "bdc-import", maxRequests: 3, windowSeconds: 600 },
    execute: (input, actor) => importClients(input, actor),
  });
}

"use server";

import { runActionMutation } from "@/lib/server/action-mutation";
import { removeClient, updateClient } from "@/lib/services/bdc/client";
import { createClient } from "@/lib/services/bdc/create-client";
import { importClients } from "@/lib/services/bdc/import";

export async function createClientAction(input: unknown) {
  return runActionMutation({
    input,
    scope: "/api/v1/bdc/clients",
    method: "POST",
    execute: (actor) => createClient(input, actor),
  });
}

export async function updateClientAction(id: string, input: unknown) {
  return runActionMutation({
    input,
    scope: "/api/v1/bdc/clients/:id",
    method: "PUT",
    execute: (actor) => updateClient(input, actor, id),
  });
}

export async function deleteClientAction(id: string) {
  return runActionMutation({
    input: id,
    scope: "/api/v1/bdc/clients/:id",
    method: "DELETE",
    execute: (actor) => removeClient(undefined, actor, id),
  });
}

export async function importClientsAction(input: unknown) {
  return runActionMutation({
    input,
    scope: "bdc-import",
    method: "POST",
    import: true,
    execute: (actor) => importClients(input, actor),
  });
}

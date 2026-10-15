"use server";

import { runActionMutation } from "@/lib/server/action-mutation";
import { createInventoryMotorcycle } from "@/lib/services/inventory/create-motorcycle";
import { importInventory } from "@/lib/services/inventory/import";
import {
  removeInventoryMotorcycle,
  updateInventoryMotorcycle,
} from "@/lib/services/inventory/motorcycle";

export async function createMotorcycleAction(input: unknown) {
  return runActionMutation({
    input,
    scope: "/api/v1/inventory/motorcycles",
    method: "POST",
    execute: (actor) => createInventoryMotorcycle(input, actor),
  });
}

export async function updateMotorcycleAction(id: string, input: unknown) {
  return runActionMutation({
    input,
    scope: "/api/v1/inventory/motorcycles/:id",
    method: "PUT",
    execute: (actor) => updateInventoryMotorcycle(input, actor, id),
  });
}

export async function deleteMotorcycleAction(id: string) {
  return runActionMutation({
    input: id,
    scope: "/api/v1/inventory/motorcycles/:id",
    method: "DELETE",
    execute: (actor) => removeInventoryMotorcycle(undefined, actor, id),
  });
}

export async function importMotorcyclesAction(input: unknown) {
  return runActionMutation({
    input,
    scope: "inventory-import",
    method: "POST",
    import: true,
    execute: (actor) => importInventory(input, actor),
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/require-user";
import {
  deleteClient as dalDeleteClient,
  getClients as dalGetClients,
} from "@/lib/data/client";
import { getMotorcycleByChassis } from "@/lib/data/motorcycle";

export async function getClientsAction() {
  await requireAuth();
  return dalGetClients();
}

export async function searchChassisAction(chassis: string) {
  await requireAuth();
  return getMotorcycleByChassis(chassis);
}

export async function deleteClientAction(id: string) {
  await requireAuth();

  try {
    await dalDeleteClient(id);
    revalidatePath("/bdc");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao remover cliente." };
  }
}

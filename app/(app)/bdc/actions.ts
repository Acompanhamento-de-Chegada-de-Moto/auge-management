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

export async function importSpreadsheetAction(formData: FormData) {
  await requireAuth();

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "Nenhum arquivo enviado." };
  }

  const allowedExtensions = [".xlsx", ".xls", ".ods", ".csv"];
  const fileName = file.name.toLowerCase();
  const isValid = allowedExtensions.some((ext) => fileName.endsWith(ext));

  if (!isValid) {
    return { success: false, error: "Formato de arquivo não suportado." };
  }

  // TODO: Parsear planilha e criar registros no banco
  return {
    success: true,
    message: `Arquivo "${file.name}" recebido com sucesso. Processamento em breve.`,
  };
}

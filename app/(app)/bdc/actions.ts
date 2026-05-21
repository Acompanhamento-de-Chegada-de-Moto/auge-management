"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/require-user";
import {
  deleteClient as dalDeleteClient,
  getClientById as dalGetClientById,
  getClients as dalGetClients,
} from "@/lib/data/client";
import { getMotorcycleByChassis } from "@/lib/data/motorcycle";
import { createAuditLog } from "@/lib/data/audit-log";
import { sanitizeForAudit } from "@/lib/utils";

export async function getClientsAction() {
  await requireAuth();
  return dalGetClients();
}

export async function searchChassisAction(chassis: string) {
  await requireAuth();
  return getMotorcycleByChassis(chassis);
}

export async function deleteClientAction(id: string) {
  const user = await requireAuth();

  try {
    const client = await dalGetClientById(id);
    await dalDeleteClient(id);

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: "DELETE",
      entityType: "CLIENT",
      entityId: id,
      entityName: client?.name,
      oldValue: sanitizeForAudit(client),
    });

    revalidatePath("/bdc");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao remover cliente." };
  }
}

export async function importSpreadsheetAction(formData: FormData) {
  const user = await requireAuth();

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

  await createAuditLog({
    userId: user.id,
    userName: user.name,
    action: "IMPORT",
    entityType: "SPREADSHEET",
    entityName: file.name,
    metadata: { fileName: file.name, fileSize: file.size },
  });

  // TODO: Parsear planilha e criar registros no banco
  return {
    success: true,
    message: `Arquivo "${file.name}" recebido com sucesso. Processamento em breve.`,
  };
}

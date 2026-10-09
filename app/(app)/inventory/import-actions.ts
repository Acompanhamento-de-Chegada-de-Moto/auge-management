"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import {
  importMotorcycleSpreadsheet,
  type MotorcycleImportRow,
} from "@/lib/data/motorcycle";

function formatImportMessage(counts: {
  created: number;
  updated: number;
  skipped: number;
}): string {
  const parts: string[] = [];
  if (counts.created) {
    parts.push(
      `${counts.created} moto${counts.created === 1 ? "" : "s"} criada${counts.created === 1 ? "" : "s"}`,
    );
  }
  if (counts.updated) {
    parts.push(
      `${counts.updated} moto${counts.updated === 1 ? "" : "s"} atualizada${counts.updated === 1 ? "" : "s"}`,
    );
  }
  if (counts.skipped) {
    parts.push(
      `${counts.skipped} linha${counts.skipped === 1 ? "" : "s"} ignorada${counts.skipped === 1 ? "" : "s"}`,
    );
  }
  return `Importação concluída. ${parts.length ? parts.join(", ") : "Nenhuma alteração."}`;
}

export async function importMotorcyclesAction(
  rows: MotorcycleImportRow[],
): Promise<{ status: "success" | "error"; message: string }> {
  await requireAuth();

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      status: "error",
      message: "A planilha não contém linhas para importar.",
    };
  }
  if (rows.length > 10_000) {
    return {
      status: "error",
      message: "A importação está limitada a 10.000 linhas por vez.",
    };
  }

  try {
    const counts = await importMotorcycleSpreadsheet(rows);
    revalidatePath("/inventory");
    revalidatePath("/bdc");
    revalidatePath("/tracking", "layout");
    return { status: "success", message: formatImportMessage(counts) };
  } catch (error) {
    console.error("[inventory-import] Erro ao importar planilha:", error);
    return {
      status: "error",
      message: "Não foi possível concluir a importação.",
    };
  }
}

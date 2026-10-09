"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import {
  type BDCSpreadsheetRow,
  importBDCSpreadsheet,
} from "@/lib/data/client";

interface ImportResult {
  status: "success" | "error";
  message: string;
}

function buildImportMessage(counts: {
  created: number;
  linked: number;
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
  if (counts.linked) {
    parts.push(
      `${counts.linked} moto${counts.linked === 1 ? "" : "s"} vinculada${counts.linked === 1 ? "" : "s"}`,
    );
  }
  if (counts.skipped) {
    parts.push(
      `${counts.skipped} linha${counts.skipped === 1 ? "" : "s"} ignorada${counts.skipped === 1 ? "" : "s"}`,
    );
  }

  return parts.length
    ? `Importação concluída. ${parts.join(", ")}.`
    : "Importação concluída. Nenhuma alteração necessária.";
}

export async function importSpreadsheetAction(
  rows: BDCSpreadsheetRow[],
): Promise<ImportResult> {
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
    const counts = await importBDCSpreadsheet(rows);
    revalidatePath("/bdc");
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");

    return { status: "success", message: buildImportMessage(counts) };
  } catch (error) {
    console.error("[import] Erro ao importar planilha:", error);
    return {
      status: "error",
      message:
        error instanceof Error && error.message.includes("Unique constraint")
          ? "Foi encontrado um CPF ou chassi duplicado. Confira os dados da planilha e tente novamente."
          : "Não foi possível concluir a importação. Nenhuma alteração da transação foi confirmada.",
    };
  }
}

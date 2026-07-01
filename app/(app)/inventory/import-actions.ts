"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import {
  createMotorcyclesBatch,
  getAllMotorcyclesForImport,
  updateMotorcyclesBatch,
} from "@/lib/data/motorcycle";

interface ImportRow {
  chassis: string;
  model: string;
  date: Date | null;
}

export async function importMotorcyclesAction(
  rows: ImportRow[],
): Promise<{ status: "success" | "error"; message: string }> {
  await requireAuth();

  try {
    const existingMotorcycles = await getAllMotorcyclesForImport();
    const motoByChassi = new Map(existingMotorcycles.map((m) => [m.chassi, m]));
    const pendingChassis = new Set<string>();

    const toCreate: Array<{
      chassi: string;
      model: string;
      forecastArrival: Date | null;
    }> = [];

    const toUpdate: Array<{
      chassi: string;
      forecastArrival: Date;
    }> = [];

    let skipped = 0;

    for (const row of rows) {
      try {
        if (!row.chassis) {
          skipped++;
          continue;
        }

        const existingInDb = motoByChassi.get(row.chassis);

        if (existingInDb) {
          if (row.date) {
            toUpdate.push({ chassi: row.chassis, forecastArrival: row.date });
          }
        } else if (!pendingChassis.has(row.chassis)) {
          pendingChassis.add(row.chassis);
          toCreate.push({
            chassi: row.chassis,
            model: row.model || "",
            forecastArrival: row.date ?? null,
          });
        } else if (row.date) {
          const pending = toCreate.find((e) => e.chassi === row.chassis);
          if (pending) {
            pending.forecastArrival = row.date;
          }
        }
      } catch {
        skipped++;
      }
    }

    if (toCreate.length > 0) {
      await createMotorcyclesBatch(toCreate);
    }

    if (toUpdate.length > 0) {
      await updateMotorcyclesBatch(toUpdate);
    }

    const parts: string[] = [];
    if (toCreate.length > 0)
      parts.push(`${toCreate.length} moto${toCreate.length > 1 ? "s" : ""} criada${toCreate.length > 1 ? "s" : ""}`);
    if (toUpdate.length > 0)
      parts.push(`${toUpdate.length} moto${toUpdate.length > 1 ? "s" : ""} atualizada${toUpdate.length > 1 ? "s" : ""}`);
    if (skipped > 0)
      parts.push(`${skipped} linha${skipped > 1 ? "s" : ""} ignorada${skipped > 1 ? "s" : ""}`);

    revalidatePath("/inventory");

    return {
      status: "success",
      message: `Importação concluída. ${parts.length > 0 ? parts.join(", ") : "Nenhuma alteração."}.`,
    };
  } catch (err) {
    console.error("[import] Erro fatal:", err);
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Erro interno ao importar planilha.",
    };
  }
}

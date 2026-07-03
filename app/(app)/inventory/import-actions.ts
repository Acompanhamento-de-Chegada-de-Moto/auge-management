"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import {
  createMotorcycle,
  getAllMotorcyclesForImport,
  updateMotorcycleByChassis,
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
    const motoByChassi = new Map(
      existingMotorcycles.map((m) => [m.chassi.trim().toUpperCase(), m]),
    );
    const processedChassis = new Set<string>();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      const chassi = row.chassis.trim().toUpperCase();
      const model = row.model.trim();

      if (!chassi) {
        skipped++;
        continue;
      }

      if (processedChassis.has(chassi)) {
        skipped++;
        continue;
      }

      const existing = motoByChassi.get(chassi);

      if (existing) {
        const shouldUpdate =
          (row.date && !existing.forecastArrival) ||
          (row.date &&
            existing.forecastArrival &&
            existing.forecastArrival.getTime() !== row.date.getTime()) ||
          (model && existing.model !== model);

        if (shouldUpdate) {
          await updateMotorcycleByChassis(existing.chassi, {
            model: model || existing.model,
            forecastArrival: row.date ?? existing.forecastArrival ?? null,
          });
          updated++;
        }
      } else {
        await createMotorcycle({
          chassi,
          model,
          forecastArrival: row.date,
        });
        created++;
      }

      processedChassis.add(chassi);
    }

    revalidatePath("/inventory");
    revalidatePath("/bdc");
    revalidatePath("/tracking", "layout");

    const parts: string[] = [];
    if (created > 0) {
      parts.push(
        `${created} moto${created > 1 ? "s" : ""} criada${created > 1 ? "s" : ""}`,
      );
    }
    if (updated > 0) {
      parts.push(
        `${updated} moto${updated > 1 ? "s" : ""} atualizada${updated > 1 ? "s" : ""}`,
      );
    }
    if (skipped > 0) {
      parts.push(
        `${skipped} linha${skipped > 1 ? "s" : ""} ignorada${skipped > 1 ? "s" : ""}`,
      );
    }

    return {
      status: "success",
      message: `Importação concluída. ${parts.length > 0 ? parts.join(", ") : "Nenhuma alteração."}.`,
    };
  } catch (err) {
    console.error("[import] Erro fatal:", err);
    return {
      status: "error",
      message:
        err instanceof Error
          ? err.message
          : "Erro interno ao importar planilha.",
    };
  }
}

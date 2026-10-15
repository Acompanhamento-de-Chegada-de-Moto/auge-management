import "server-only";
import { z } from "zod";
import { importMotorcycleSpreadsheet } from "@/lib/data/motorcycle";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { revalidateMotorcyclePages } from "@/lib/services/revalidate-motorcycle-pages";

const rowSchema = z.object({
  chassis: z.string().max(40),
  model: z.string().max(200),
  date: z.date().nullable(),
});

import { normalizeDateFields } from "@/lib/server/normalize-date-fields";
export async function importInventory(
  input: unknown,
  actor: MutationActor,
): Promise<MutationResult> {
  try {
    const body = input;
    const normalized = Array.isArray(body)
      ? body.map((row) => normalizeDateFields(row, ["date"]))
      : body;
    const parsed = z.array(rowSchema).min(1).max(10_000).safeParse(normalized);
    if (!parsed.success)
      return mutationError(
        "Linhas inválidas ou limite de 10.000 excedido.",
        400,
      );

    const counts = await importMotorcycleSpreadsheet(parsed.data);
    revalidateMotorcyclePages(actor.transport);
    const parts = [
      counts.created ? `${counts.created} moto(s) criada(s)` : "",
      counts.updated ? `${counts.updated} moto(s) atualizada(s)` : "",
      counts.skipped ? `${counts.skipped} linha(s) ignorada(s)` : "",
    ].filter(Boolean);

    return mutationSuccess({
      message: `Importação concluída. ${parts.length ? parts.join(", ") : "Nenhuma alteração."}`,
    });
  } catch (error) {
    console.error("[service/inventory/import] Falha na importação:", error);
    return mutationError("Não foi possível concluir a importação.", 500);
  }
}

import "server-only";
import { z } from "zod";
import { importBDCSpreadsheet } from "@/lib/data/client";
import { withDocumentAlias } from "@/lib/document";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { revalidateMotorcyclePages } from "@/lib/services/revalidate-motorcycle-pages";

const rowSchema = z.object({
  chassi: z.string().max(40),
  cliente: z.string().max(200),
  consultor: z.string().max(200),
  document: z.string().max(20),
  modelo: z.string().max(200),
  cidade: z.string().max(200),
  faturamento: z.string().max(20).nullable(),
});

export async function importClients(
  input: unknown,
  actor: MutationActor,
): Promise<MutationResult> {
  try {
    const body = Array.isArray(input) ? input.map(withDocumentAlias) : input;
    const parsed = z.array(rowSchema).min(1).max(10_000).safeParse(body);
    if (!parsed.success)
      return mutationError(
        "Linhas inválidas ou limite de 10.000 excedido.",
        400,
      );

    const counts = await importBDCSpreadsheet(parsed.data);
    revalidateMotorcyclePages(actor.transport);
    const parts = [
      counts.created ? `${counts.created} moto(s) criada(s)` : "",
      counts.updated ? `${counts.updated} moto(s) atualizada(s)` : "",
      counts.linked ? `${counts.linked} moto(s) vinculada(s)` : "",
      counts.skipped ? `${counts.skipped} linha(s) ignorada(s)` : "",
    ].filter(Boolean);

    return mutationSuccess({
      message: parts.length
        ? `Importação concluída. ${parts.join(", ")}.`
        : "Importação concluída. Nenhuma alteração necessária.",
    });
  } catch (error) {
    console.error("[service/bdc/import] Falha na importação:", error);
    return mutationError("Não foi possível concluir a importação.", 500);
  }
}

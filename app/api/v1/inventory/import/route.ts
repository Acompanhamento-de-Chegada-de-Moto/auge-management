import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  apiError,
  assertSameOrigin,
  authorizeApiRequest,
  normalizeDateFields,
  readJsonBody,
} from "@/lib/api/auth";
import { importMotorcycleSpreadsheet } from "@/lib/data/motorcycle";

const rowSchema = z.object({
  chassis: z.string().max(40),
  model: z.string().max(200),
  date: z.date().nullable(),
});

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request, undefined, {
    scope: "inventory-import",
    maxRequests: 3,
    windowSeconds: 10 * 60,
  });
  if (authorization.response) return authorization.response;

  try {
    const body = await readJsonBody(request, 5 * 1024 * 1024);
    const normalized = Array.isArray(body)
      ? body.map((row) => normalizeDateFields(row, ["date"]))
      : body;
    const parsed = z.array(rowSchema).min(1).max(10_000).safeParse(normalized);
    if (!parsed.success)
      return apiError("Linhas inválidas ou limite de 10.000 excedido.", 400);

    const counts = await importMotorcycleSpreadsheet(parsed.data);
    const parts = [
      counts.created ? `${counts.created} moto(s) criada(s)` : "",
      counts.updated ? `${counts.updated} moto(s) atualizada(s)` : "",
      counts.skipped ? `${counts.skipped} linha(s) ignorada(s)` : "",
    ].filter(Boolean);

    revalidatePath("/inventory");
    revalidatePath("/bdc");
    revalidatePath("/tracking", "layout");
    return Response.json({
      message: `Importação concluída. ${parts.length ? parts.join(", ") : "Nenhuma alteração."}`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
      return apiError("Arquivo de importação muito grande.", 413);
    }
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    console.error("[api/v1/inventory/import] Falha na importação:", error);
    return apiError("Não foi possível concluir a importação.", 500);
  }
}

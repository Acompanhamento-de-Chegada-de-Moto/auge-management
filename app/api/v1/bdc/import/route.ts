import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  apiError,
  assertSameOrigin,
  authorizeApiRequest,
  readJsonBody,
} from "@/lib/api/auth";
import { importBDCSpreadsheet } from "@/lib/data/client";

const rowSchema = z.object({
  chassi: z.string().max(40),
  cliente: z.string().max(200),
  consultor: z.string().max(200),
  cpf: z.string().max(20),
  modelo: z.string().max(200),
  cidade: z.string().max(200),
  faturamento: z.string().max(20).nullable(),
});

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request, undefined, {
    scope: "bdc-import",
    maxRequests: 3,
    windowSeconds: 10 * 60,
  });
  if (authorization.response) return authorization.response;

  try {
    const body = await readJsonBody(request, 5 * 1024 * 1024);
    const parsed = z.array(rowSchema).min(1).max(10_000).safeParse(body);
    if (!parsed.success)
      return apiError("Linhas inválidas ou limite de 10.000 excedido.", 400);

    const counts = await importBDCSpreadsheet(parsed.data);
    const parts = [
      counts.created ? `${counts.created} moto(s) criada(s)` : "",
      counts.updated ? `${counts.updated} moto(s) atualizada(s)` : "",
      counts.linked ? `${counts.linked} moto(s) vinculada(s)` : "",
      counts.skipped ? `${counts.skipped} linha(s) ignorada(s)` : "",
    ].filter(Boolean);

    revalidatePath("/bdc");
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return Response.json({
      message: parts.length
        ? `Importação concluída. ${parts.join(", ")}.`
        : "Importação concluída. Nenhuma alteração necessária.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
      return apiError("Arquivo de importação muito grande.", 413);
    }
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    console.error("[api/v1/bdc/import] Falha na importação:", error);
    return apiError("Não foi possível concluir a importação.", 500);
  }
}

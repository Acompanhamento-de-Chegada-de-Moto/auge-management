import { revalidatePath } from "next/cache";
import {
  apiError,
  assertSameOrigin,
  authorizeApiRequest,
  readJsonBody,
} from "@/lib/api/auth";
import { revalidateListingCache } from "@/lib/api/revalidate-listing-cache";
import { createMotorcycle } from "@/lib/data/motorcycle";
import { createMotorcycleSchema } from "@/lib/zod-schemas/motorcycle-schema";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request);
  if (authorization.response) return authorization.response;

  try {
    const parsed = createMotorcycleSchema.safeParse(
      await readJsonBody(request),
    );
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    }

    const data = parsed.data;
    await createMotorcycle({
      chassi: data.chassi.trim().toUpperCase(),
      model: data.model.trim(),
      forecastArrival: data.forecastArrival ?? null,
      forecastArrivalStatus: data.forecastArrivalStatus,
      registrationStatus: data.registrationStatus ?? undefined,
      registrationDate: data.registrationDate ?? null,
      clientId: data.clientId ?? undefined,
    });

    revalidateListingCache();
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return Response.json(
      { message: "Motocicleta cadastrada com sucesso no estoque." },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
      return apiError("Requisição muito grande.", 413);
    }
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return apiError(
        "Já existe uma motocicleta cadastrada com este chassi.",
        409,
      );
    }
    console.error("[api/v1/inventory/motorcycles] Falha ao criar:", error);
    return apiError("Erro interno ao cadastrar motocicleta.", 500);
  }
}

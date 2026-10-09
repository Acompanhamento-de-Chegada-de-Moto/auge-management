import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  apiError,
  assertSameOrigin,
  authorizeApiRequest,
  readJsonBody,
} from "@/lib/api/auth";
import {
  deleteMotorcycle,
  updateMotorcycleSafely,
} from "@/lib/data/motorcycle";
import { createMotorcycleSchema } from "@/lib/zod-schemas/motorcycle-schema";

type RouteContext = { params: Promise<{ motorcycleId: string }> };
const idSchema = z.string().uuid();

export async function PUT(request: Request, { params }: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request);
  if (authorization.response) return authorization.response;

  const { motorcycleId } = await params;
  if (!idSchema.safeParse(motorcycleId).success)
    return apiError("ID inválido.", 400);

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
    const error = await updateMotorcycleSafely(motorcycleId, {
      chassi: data.chassi.trim().toUpperCase(),
      model: data.model.trim(),
      forecastArrival: data.forecastArrival,
      forecastArrivalStatus: data.forecastArrivalStatus,
    });
    if (error) return apiError(error, 409);

    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return Response.json({ message: "Motocicleta atualizada com sucesso." });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
      return apiError("Requisição muito grande.", 413);
    }
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    console.error(
      "[api/v1/inventory/motorcycles/:id] Falha ao atualizar:",
      error,
    );
    return apiError("Erro interno ao atualizar a motocicleta.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const authorization = await authorizeApiRequest(request);
  if (authorization.response) return authorization.response;

  const { motorcycleId } = await params;
  if (!idSchema.safeParse(motorcycleId).success)
    return apiError("ID inválido.", 400);

  try {
    const result = await deleteMotorcycle(motorcycleId);
    if (result.count === 0) return apiError("Motocicleta não encontrada.", 404);

    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return Response.json({
      message: "Motocicleta deletada com sucesso do estoque.",
    });
  } catch (error) {
    console.error(
      "[api/v1/inventory/motorcycles/:id] Falha ao excluir:",
      error,
    );
    return apiError("Erro interno ao excluir a motocicleta.", 500);
  }
}

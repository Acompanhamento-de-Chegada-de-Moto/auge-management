import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { revalidateListingCache } from "@/lib/api/revalidate-listing-cache";
import {
  deleteMotorcycle,
  updateMotorcycleSafely,
} from "@/lib/data/motorcycle";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { createMotorcycleSchema } from "@/lib/zod-schemas/motorcycle-schema";

const idSchema = z.string().uuid();

export async function updateInventoryMotorcycle(
  input: unknown,
  actor: MutationActor,
  motorcycleId: string,
): Promise<MutationResult> {
  if (!idSchema.safeParse(motorcycleId).success)
    return mutationError("ID inválido.", 400);

  try {
    const parsed = createMotorcycleSchema.safeParse(input);
    if (!parsed.success) {
      return mutationError(
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
    if (error) return mutationError(error, 409);

    revalidateListingCache(actor.transport);
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return mutationSuccess({ message: "Motocicleta atualizada com sucesso." });
  } catch (error) {
    console.error(
      "[service/inventory/motorcycles/:id] Falha ao atualizar:",
      error,
    );
    return mutationError("Erro interno ao atualizar a motocicleta.", 500);
  }
}

export async function removeInventoryMotorcycle(
  _input: unknown,
  actor: MutationActor,
  motorcycleId: string,
): Promise<MutationResult> {
  if (!idSchema.safeParse(motorcycleId).success)
    return mutationError("ID inválido.", 400);

  try {
    const result = await deleteMotorcycle(motorcycleId);
    if (result.count === 0)
      return mutationError("Motocicleta não encontrada.", 404);

    revalidateListingCache(actor.transport);
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return mutationSuccess({
      message: "Motocicleta deletada com sucesso do estoque.",
    });
  } catch (error) {
    console.error(
      "[service/inventory/motorcycles/:id] Falha ao excluir:",
      error,
    );
    return mutationError("Erro interno ao excluir a motocicleta.", 500);
  }
}

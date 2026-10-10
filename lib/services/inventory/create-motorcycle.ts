import "server-only";
import { revalidatePath } from "next/cache";
import { revalidateListingCache } from "@/lib/api/revalidate-listing-cache";
import { createMotorcycle } from "@/lib/data/motorcycle";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { createMotorcycleSchema } from "@/lib/zod-schemas/motorcycle-schema";

export async function createInventoryMotorcycle(
  input: unknown,
  actor: MutationActor,
): Promise<MutationResult> {
  try {
    const parsed = createMotorcycleSchema.safeParse(input);
    if (!parsed.success) {
      return mutationError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    }

    const data = parsed.data;
    await createMotorcycle(
      {
        chassi: data.chassi.trim().toUpperCase(),
        model: data.model.trim(),
        forecastArrival: data.forecastArrival ?? null,
        forecastArrivalStatus: data.forecastArrivalStatus,
        registrationStatus: data.registrationStatus ?? undefined,
        registrationDate: data.registrationDate ?? null,
        clientId: data.clientId ?? undefined,
      },
      `${actor.user.name} (${actor.user.id})`,
    );

    revalidateListingCache(actor.transport);
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return mutationSuccess(
      { message: "Motocicleta cadastrada com sucesso no estoque." },
      { status: 201 },
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return mutationError(
        "Já existe uma motocicleta cadastrada com este chassi.",
        409,
      );
    }
    console.error("[service/inventory/motorcycles] Falha ao criar:", error);
    return mutationError("Erro interno ao cadastrar motocicleta.", 500);
  }
}

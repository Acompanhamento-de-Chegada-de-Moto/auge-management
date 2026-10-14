import "server-only";
import { revalidatePath } from "next/cache";
import { revalidateListingCache } from "@/lib/api/revalidate-listing-cache";
import { mapArrivalStatus, mapRegistrationStatus } from "@/lib/bdc-status";
import { createBDCClient } from "@/lib/data/client";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { normalizeDateFields } from "@/lib/server/normalize-date-fields";
import { customerSchema } from "@/validators/customer-schema";
export async function createClient(
  input: unknown,
  actor: MutationActor,
): Promise<MutationResult> {
  try {
    const body = normalizeDateFields(input, [
      "billingDate",
      "forecastDate",
      "registrationDate",
      "newForecastDate",
    ]);
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return mutationError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    }

    const data = parsed.data;
    await createBDCClient(
      {
        cpf: data.cpf,
        name: data.customerName,
        sellerName: data.sellerName,
        city: data.city,
        billingDate: data.billingDate,
        motorcycle: {
          chassis: data.chassis.trim().toUpperCase(),
          model: data.model,
          forecastDate: data.forecastDate,
          arrivalStatus: mapArrivalStatus(data.arrivalStatus),
          registrationStatus: mapRegistrationStatus(data.registrationStatus),
          registrationDate:
            data.registrationStatus === "Sem Emplacamento"
              ? undefined
              : data.registrationDate,
        },
      },
      `${actor.user.name} (${actor.user.id})`,
    );

    revalidateListingCache(actor.transport);
    revalidatePath("/bdc");
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return mutationSuccess(
      { message: "Cliente cadastrado com sucesso." },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("chassi")
    ) {
      return mutationError(error.message, 409);
    }
    console.error("[service/bdc/clients] Falha ao criar cliente:", error);
    return mutationError("Erro interno ao cadastrar cliente.", 500);
  }
}

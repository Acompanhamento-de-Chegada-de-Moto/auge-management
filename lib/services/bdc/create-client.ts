import "server-only";
import { mapArrivalStatus, mapRegistrationStatus } from "@/lib/bdc-status";
import { createBDCClient } from "@/lib/data/client";
import { withDocumentAlias } from "@/lib/document";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { normalizeDateFields } from "@/lib/server/normalize-date-fields";
import { revalidateMotorcyclePages } from "@/lib/services/revalidate-motorcycle-pages";
import { customerSchema } from "@/validators/customer-schema";
export async function createClient(
  input: unknown,
  actor: MutationActor,
): Promise<MutationResult> {
  try {
    const body = normalizeDateFields(withDocumentAlias(input), [
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
        document: data.document,
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

    revalidateMotorcyclePages(actor.transport);
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

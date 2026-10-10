import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { revalidateListingCache } from "@/lib/api/revalidate-listing-cache";
import { mapArrivalStatus, mapRegistrationStatus } from "@/lib/bdc-status";
import { deleteClient, updateBDCClient } from "@/lib/data/client";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { customerSchema } from "@/validators/customer-schema";

const idSchema = z.string().uuid();

import { normalizeDateFields } from "@/lib/server/normalize-date-fields";
export async function updateClient(
  input: unknown,
  actor: MutationActor,
  clientId: string,
): Promise<MutationResult> {
  if (!idSchema.safeParse(clientId).success)
    return mutationError("ID inválido.", 400);

  try {
    const body = input;
    const payloadSchema = z.object({
      motorcycleId: z.string().uuid().nullable().optional(),
      values: z.unknown(),
    });
    const payload = payloadSchema.safeParse(body);
    if (!payload.success) return mutationError("Dados inválidos.", 400);

    const values = normalizeDateFields(payload.data.values, [
      "billingDate",
      "forecastDate",
      "registrationDate",
      "newForecastDate",
    ]);
    const parsed = customerSchema.safeParse(values);
    if (!parsed.success) {
      return mutationError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    }

    const data = parsed.data;
    const chassis = data.chassis.trim().toUpperCase();
    const additionalChassis =
      data.newChassis?.trim().toUpperCase() || undefined;
    if (additionalChassis === chassis) {
      return mutationError(
        "O chassi adicional deve ser diferente do chassi principal.",
        400,
      );
    }

    const error = await updateBDCClient({
      clientId,
      motorcycleId: payload.data.motorcycleId ?? null,
      cpf: data.cpf,
      name: data.customerName,
      sellerName: data.sellerName,
      city: data.city,
      billingDate: data.billingDate,
      motorcycle: {
        chassis,
        model: data.model,
        forecastDate: data.forecastDate,
        arrivalStatus: mapArrivalStatus(data.arrivalStatus),
        arrivalStatusInput: data.arrivalStatus,
        registrationStatus: mapRegistrationStatus(data.registrationStatus),
        registrationDate: data.registrationDate,
      },
      additionalMotorcycle: additionalChassis
        ? {
            chassis: additionalChassis,
            model: data.newModel ?? "",
            forecastDate: data.newForecastDate,
          }
        : undefined,
    });

    if (error) return mutationError(error, 409);
    revalidateListingCache(actor.transport);
    revalidatePath("/bdc");
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return mutationSuccess({
      message: "Cadastro do cliente atualizado com sucesso.",
    });
  } catch (error) {
    console.error("[service/bdc/clients/:clientId] Falha ao atualizar:", error);
    return mutationError("Erro interno ao atualizar os dados do cliente.", 500);
  }
}

export async function removeClient(
  _input: unknown,
  actor: MutationActor,
  clientId: string,
): Promise<MutationResult> {
  if (!idSchema.safeParse(clientId).success)
    return mutationError("ID inválido.", 400);

  try {
    await deleteClient(clientId);
    revalidateListingCache(actor.transport);
    revalidatePath("/bdc");
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return mutationSuccess({
      message: "Cliente deletado com sucesso do sistema.",
    });
  } catch (error) {
    console.error("[service/bdc/clients/:clientId] Falha ao excluir:", error);
    return mutationError("Erro interno ao excluir o cliente.", 500);
  }
}

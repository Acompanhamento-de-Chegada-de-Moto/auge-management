import "server-only";
import { z } from "zod";
import { mapArrivalStatus, mapRegistrationStatus } from "@/lib/bdc-status";
import { deleteClient, updateBDCClient } from "@/lib/data/client";
import { withDocumentAlias } from "@/lib/document";
import {
  type MutationActor,
  type MutationResult,
  mutationError,
  mutationSuccess,
} from "@/lib/server/mutation-result";
import { revalidateMotorcyclePages } from "@/lib/services/revalidate-motorcycle-pages";
import { editCustomerSchema } from "@/validators/customer-schema";

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

    const values = normalizeDateFields(withDocumentAlias(payload.data.values), [
      "billingDate",
      "forecastDate",
      "registrationDate",
      "newForecastDate",
    ]);
    const parsed = editCustomerSchema.safeParse(values);
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

    const error = await updateBDCClient(
      {
        clientId,
        motorcycleId: payload.data.motorcycleId ?? null,
        document: data.document,
        name: data.customerName,
        sellerName: data.sellerName,
        city: data.city,
        billingDate: data.billingDate,
        motorcycle: {
          chassis,
          model: data.model,
          forecastDate: data.forecastDate,
          arrivalStatus: mapArrivalStatus(data.arrivalStatus),
          registrationStatus: mapRegistrationStatus(data.registrationStatus),
          registrationDate:
            data.registrationStatus === "Sem Emplacamento"
              ? undefined
              : data.registrationDate,
        },
        additionalMotorcycle: additionalChassis
          ? {
              chassis: additionalChassis,
              model: data.newModel ?? "",
              forecastDate: data.newForecastDate,
            }
          : undefined,
      },
      `${actor.user.name} (${actor.user.id})`,
    );

    if (error) return mutationError(error, 409);
    revalidateMotorcyclePages(actor.transport);
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
    const result = await deleteClient(clientId);
    if (!result.count) {
      revalidateMotorcyclePages(actor.transport);
      return mutationError(
        "Cliente não encontrado. Ele pode ter sido excluído em outra sessão.",
        404,
      );
    }
    revalidateMotorcyclePages(actor.transport);
    return mutationSuccess({
      message: "Cliente deletado com sucesso do sistema.",
    });
  } catch (error) {
    console.error("[service/bdc/clients/:clientId] Falha ao excluir:", error);
    return mutationError("Erro interno ao excluir o cliente.", 500);
  }
}

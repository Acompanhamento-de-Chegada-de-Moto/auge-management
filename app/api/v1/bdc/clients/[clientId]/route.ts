import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  apiError,
  assertSameOrigin,
  authorizeApiRequest,
  normalizeDateFields,
  readJsonBody,
} from "@/lib/api/auth";
import { revalidateListingCache } from "@/lib/api/revalidate-listing-cache";
import { deleteClient, updateBDCClient } from "@/lib/data/client";
import {
  mapArrivalStatus,
  mapRegistrationStatus,
} from "@/app/(app)/bdc/_lib/status-mappers";
import { customerSchema } from "@/validators/customer-schema";

type RouteContext = { params: Promise<{ clientId: string }> };
const idSchema = z.string().uuid();

export async function PUT(request: Request, { params }: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const authorization = await authorizeApiRequest(request);
  if (authorization.response) return authorization.response;

  const { clientId } = await params;
  if (!idSchema.safeParse(clientId).success)
    return apiError("ID inválido.", 400);

  try {
    const body = await readJsonBody(request);
    const payloadSchema = z.object({
      motorcycleId: z.string().uuid().nullable().optional(),
      values: z.unknown(),
    });
    const payload = payloadSchema.safeParse(body);
    if (!payload.success) return apiError("Dados inválidos.", 400);

    const values = normalizeDateFields(payload.data.values, [
      "billingDate",
      "forecastDate",
      "registrationDate",
      "newForecastDate",
    ]);
    const parsed = customerSchema.safeParse(values);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
        400,
      );
    }

    const data = parsed.data;
    const chassis = data.chassis.trim().toUpperCase();
    const additionalChassis =
      data.newChassis?.trim().toUpperCase() || undefined;
    if (additionalChassis === chassis) {
      return apiError(
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

    if (error) return apiError(error, 409);
    revalidateListingCache();
    revalidatePath("/bdc");
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return Response.json({
      message: "Cadastro do cliente atualizado com sucesso.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
      return apiError("Requisição muito grande.", 413);
    }
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);
    console.error("[api/v1/bdc/clients/:clientId] Falha ao atualizar:", error);
    return apiError("Erro interno ao atualizar os dados do cliente.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const authorization = await authorizeApiRequest(request);
  if (authorization.response) return authorization.response;

  const { clientId } = await params;
  if (!idSchema.safeParse(clientId).success)
    return apiError("ID inválido.", 400);

  try {
    await deleteClient(clientId);
    revalidateListingCache();
    revalidatePath("/bdc");
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");
    return Response.json({
      message: "Cliente deletado com sucesso do sistema.",
    });
  } catch (error) {
    console.error("[api/v1/bdc/clients/:clientId] Falha ao excluir:", error);
    return apiError("Erro interno ao excluir o cliente.", 500);
  }
}

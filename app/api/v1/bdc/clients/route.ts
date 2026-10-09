import { revalidatePath } from "next/cache";
import {
  apiError,
  assertSameOrigin,
  authorizeApiRequest,
  normalizeDateFields,
  readJsonBody,
} from "@/lib/api/auth";
import { createBDCClient } from "@/lib/data/client";
import {
  mapArrivalStatus,
  mapRegistrationStatus,
} from "@/app/(app)/bdc/_lib/status-mappers";
import { customerSchema } from "@/validators/customer-schema";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const authorization = await authorizeApiRequest(request);
  if (authorization.response) return authorization.response;

  try {
    const body = normalizeDateFields(await readJsonBody(request), [
      "billingDate",
      "forecastDate",
      "registrationDate",
      "newForecastDate",
    ]);
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    await createBDCClient({
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
        arrivalStatusInput: data.arrivalStatus,
        registrationStatus: mapRegistrationStatus(data.registrationStatus),
        registrationDate: data.registrationDate,
      },
    });

    revalidatePath("/bdc");
    revalidatePath("/inventory");
    return Response.json(
      { message: "Cliente cadastrado com sucesso." },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
      return apiError("Requisição muito grande.", 413);
    }
    if (error instanceof SyntaxError) return apiError("JSON inválido.", 400);

    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("chassi")
    ) {
      return apiError(error.message, 409);
    }
    console.error("[api/v1/bdc/clients] Falha ao criar cliente:", error);
    return apiError("Erro interno ao cadastrar cliente.", 500);
  }
}

"use server";

import { requireAuth } from "@/app/data/user/require-auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";
import {
  type ClientSchemaType,
  clientSchema,
} from "@/lib/zod-schemas/client-schema";

function mapRegistrationStatus(
  status: string | undefined,
): "NO_PLATE" | "PLATING" | "PLATED" {
  if (!status) return "NO_PLATE";
  const map: Record<string, "NO_PLATE" | "PLATING" | "PLATED"> = {
    "Sem Emplacamento": "NO_PLATE",
    Emplacando: "PLATING",
    Emplacado: "PLATED",
  };
  return map[status] ?? "NO_PLATE";
}

export async function CreateClientAction(
  values: ClientSchemaType,
): Promise<ApiResponse> {
  await requireAuth();

  try {
    const validation = clientSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: "error",
        message: "Dados do formulário inválidos.",
      };
    }

    const {
      cpf,
      customerName,
      sellerName,
      city,
      chassis,
      model,
      forecastDate,
      registrationStatus,
      billingDate,
      registrationDate,
    } = validation.data;

    await prisma.$transaction(async (tx) => {
      const existingClient = await tx.client.findUnique({
        where: { cpf },
      });

      if (existingClient) {
        throw new Error("Já existe um cliente cadastrado com este CPF.");
      }

      const client = await tx.client.create({
        data: {
          cpf,
          name: customerName,
          sellersName: sellerName,
          city,
          billingDate: billingDate ?? null,
        },
      });

      const existingMotorcycle = await tx.motorcycle.findUnique({
        where: { chassi: chassis },
      });

      if (existingMotorcycle) {
        await tx.motorcycle.update({
          where: { id: existingMotorcycle.id },
          data: {
            clientId: client.id,
            registrationDate: registrationDate ?? null,
          },
        });
        return;
      }

      await tx.motorcycle.create({
        data: {
          chassi: chassis,
          model,
          forecastArrival: forecastDate ?? null,
          registrationStatus: mapRegistrationStatus(registrationStatus),
          registrationDate: registrationDate ?? null,
          clientId: client.id,
        },
      });
    });

    return {
      status: "success",
      message: "Cliente cadastrado com sucesso.",
    };
  } catch (error) {
    console.error(error);

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Erro interno ao cadastrar cliente.",
    };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/user/require-auth";
import { createBDCClient } from "@/lib/data/client";
import type { ApiResponse } from "@/lib/types";
import {
  type CustomerFormData,
  customerSchema,
} from "@/validators/customer-schema";

import {
  mapArrivalStatus,
  mapRegistrationStatus,
} from "../../_lib/status-mappers";

export async function CreateClientAction(
  values: CustomerFormData,
): Promise<ApiResponse> {
  await requireAuth();

  try {
    const validation = customerSchema.safeParse(values);

    if (!validation.success) {
      return {
        status: "error",
        message: "Dados do formulÃ¡rio invÃ¡lidos.",
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
      arrivalStatus,
    } = validation.data;

    await createBDCClient({
      cpf,
      name: customerName,
      sellerName,
      city,
      billingDate,
      motorcycle: {
        chassis: chassis.trim().toUpperCase(),
        model,
        forecastDate,
        arrivalStatus: mapArrivalStatus(arrivalStatus),
        arrivalStatusInput: arrivalStatus,
        registrationStatus: mapRegistrationStatus(registrationStatus),
        registrationDate,
      },
    });

    revalidatePath("/bdc");
    revalidatePath("/inventory");

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

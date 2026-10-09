"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth } from "@/app/data/user/require-auth";
import { Prisma } from "@/generated/prisma/client";
import { stripCPF } from "@/lib/cpf";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";
import {
  type CustomerFormData,
  customerSchema,
} from "@/validators/customer-schema";

type ArrivalStatus = "NO_INFORMATION" | "ARRIVED" | "DELAYED";

const arrivalStatusMap: Record<string, ArrivalStatus> = {
  "Sem Informação": "NO_INFORMATION",
  Chegou: "ARRIVED",
  Atrasada: "DELAYED",
};

const registrationStatusMap = {
  "Sem Emplacamento": "NO_PLATE",
  Emplacando: "PLATING",
  Emplacado: "PLATED",
} as const;

function resolveArrivalStatus(
  submitted: string | undefined,
  current?: ArrivalStatus | null,
): ArrivalStatus {
  if (
    (!submitted || submitted === "Sem Informação") &&
    current &&
    current !== "NO_INFORMATION"
  ) {
    return current;
  }

  return arrivalStatusMap[submitted ?? ""] ?? "NO_INFORMATION";
}

function getPrismaErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = error.meta?.target;
      const fields = Array.isArray(target)
        ? target.join(" ")
        : String(target ?? "");

      if (fields.toLowerCase().includes("cpf")) {
        return "Este CPF já está cadastrado para outro cliente.";
      }

      if (
        fields.toLowerCase().includes("chassi") ||
        fields.toLowerCase().includes("chassis")
      ) {
        return "Este chassi já está cadastrado em outra motocicleta.";
      }

      return "Já existe um registro com esses dados.";
    }

    if (error.code === "P2025") {
      return "O registro que você tentou atualizar não foi encontrado.";
    }
  }

  return "Erro interno ao atualizar os dados do cliente.";
}

export async function EditClientAction(
  clientId: string,
  motorcycleId: string | null,
  values: CustomerFormData,
): Promise<ApiResponse> {
  await requireAuth();

  const parsed = customerSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ?? "Dados do formulário inválidos.",
    };
  }

  const {
    customerName,
    cpf,
    sellerName,
    city,
    billingDate,
    chassis,
    model,
    forecastDate,
    registrationStatus,
    registrationDate,
    arrivalStatus,
    newChassis,
    newModel,
    newForecastDate,
  } = parsed.data;

  const normalizedCpf = stripCPF(cpf);
  const normalizedChassis = chassis.trim().toUpperCase();
  const normalizedNewChassis = newChassis?.trim().toUpperCase() || null;

  if (!normalizedChassis) {
    return {
      status: "error",
      message: "Informe o chassi da motocicleta.",
    };
  }

  if (normalizedNewChassis && normalizedNewChassis === normalizedChassis) {
    return {
      status: "error",
      message: "O chassi adicional deve ser diferente do chassi principal.",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.findUnique({
        where: { id: clientId },
        include: { motorcycles: true },
      });

      if (!client) {
        return {
          status: "error",
          message: "Cliente não encontrado.",
        } satisfies ApiResponse;
      }

      const cpfExists = await tx.client.findFirst({
        where: {
          cpf: normalizedCpf,
          NOT: { id: clientId },
        },
        select: { id: true },
      });

      if (cpfExists) {
        return {
          status: "error",
          message: "Este CPF já está cadastrado para outro cliente.",
        } satisfies ApiResponse;
      }

      const motorcycle = motorcycleId
        ? client.motorcycles.find((item) => item.id === motorcycleId)
        : client.motorcycles[0];

      if (motorcycleId && !motorcycle) {
        return {
          status: "error",
          message: "Motocicleta não encontrada para este cliente.",
        } satisfies ApiResponse;
      }

      const existingMainChassis = await tx.motorcycle.findUnique({
        where: { chassi: normalizedChassis },
      });

      if (existingMainChassis && existingMainChassis.id !== motorcycle?.id) {
        return {
          status: "error",
          message:
            existingMainChassis.clientId &&
            existingMainChassis.clientId !== clientId
              ? "Este chassi já está vinculado a outro cliente."
              : "Este chassi já está cadastrado em outra motocicleta.",
        } satisfies ApiResponse;
      }

      const existingNewMotorcycle = normalizedNewChassis
        ? await tx.motorcycle.findUnique({
            where: { chassi: normalizedNewChassis },
          })
        : null;

      if (
        existingNewMotorcycle &&
        existingNewMotorcycle.id === motorcycle?.id
      ) {
        return {
          status: "error",
          message:
            "A motocicleta adicional não pode ser a mesma do cadastro principal.",
        } satisfies ApiResponse;
      }

      if (
        existingNewMotorcycle?.clientId &&
        existingNewMotorcycle.clientId !== clientId
      ) {
        return {
          status: "error",
          message: "O chassi adicional já está vinculado a outro cliente.",
        } satisfies ApiResponse;
      }

      const resolvedArrivalStatus = resolveArrivalStatus(
        arrivalStatus,
        motorcycle?.forecastArrivalStatus as ArrivalStatus | null | undefined,
      );

      const resolvedRegistrationStatus =
        registrationStatusMap[registrationStatus];

      // Todas as validações de negócio acima acontecem antes das gravações.

      await tx.client.update({
        where: { id: clientId },
        data: {
          cpf: normalizedCpf,
          name: customerName,
          sellersName: sellerName,
          city,
          billingDate: billingDate ?? null,
        },
      });

      if (motorcycle) {
        await tx.motorcycle.update({
          where: { id: motorcycle.id },
          data: {
            chassi: normalizedChassis,
            model,
            forecastArrival: forecastDate ?? null,
            forecastArrivalStatus: resolvedArrivalStatus,
            registrationStatus: resolvedRegistrationStatus,
            registrationDate: registrationDate ?? null,
          },
        });
      } else {
        await tx.motorcycle.create({
          data: {
            chassi: normalizedChassis,
            model,
            forecastArrival: forecastDate ?? null,
            forecastArrivalStatus: resolvedArrivalStatus,
            registrationStatus: resolvedRegistrationStatus,
            registrationDate: registrationDate ?? null,
            clientId,
          },
        });
      }

      if (existingNewMotorcycle) {
        await tx.motorcycle.update({
          where: { id: existingNewMotorcycle.id },
          data: { clientId },
        });
      } else if (normalizedNewChassis) {
        await tx.motorcycle.create({
          data: {
            chassi: normalizedNewChassis,
            model: newModel ?? "",
            forecastArrival: newForecastDate ?? null,
            clientId,
          },
        });
      }

      return null;
    });

    if (result) {
      return result;
    }
  } catch (error) {
    console.error("Erro ao editar cliente:", error);

    return {
      status: "error",
      message: getPrismaErrorMessage(error),
    };
  }

  revalidatePath("/bdc");
  revalidatePath("/inventory");
  revalidatePath("/tracking", "layout");

  redirect("/bdc");
}

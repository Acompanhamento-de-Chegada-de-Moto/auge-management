"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/app/data/user/require-auth";
import {
  getClientById,
  updateClient,
} from "@/lib/data/client";
import { prisma } from "@/lib/db";
import {
  updateMotorcycle,
  getMotorcycleByChassis,
  createMotorcycle,
} from "@/lib/data/motorcycle";
import type { ApiResponse } from "@/lib/types";
import { stripCPF } from "@/lib/cpf";
import {
  type CustomerFormData,
  customerSchema,
} from "@/validators/customer-schema";

export async function EditClientAction(
  clientId: string,
  values: CustomerFormData,
): Promise<ApiResponse> {
  await requireAuth();

  const parsed = customerSchema.safeParse(values);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      status: "error",
      message: firstIssue?.message ?? "Dados do formulário inválidos.",
    };
  }

  try {
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
      newChassis,
      newModel,
      newForecastDate,
    } = parsed.data;

    const client = await getClientById(clientId);
    if (!client) {
      return { status: "error", message: "Cliente não encontrado." };
    }

    const strippedCpf = stripCPF(cpf);
    if (strippedCpf !== client.cpf) {
      const cpfExists = await prisma.client.findFirst({
        where: { cpf: strippedCpf, NOT: { id: clientId } },
      });
      if (cpfExists) {
        return {
          status: "error",
          message: "Este CPF já está cadastrado para outro cliente.",
        };
      }
    }

    await updateClient(clientId, {
      cpf,
      name: customerName,
      sellerName,
      city,
      billingDate: billingDate ?? null,
    });

    const motorcycle = client.motorcycles[0];
    if (motorcycle) {
      if (chassis !== motorcycle.chassi) {
        const chassiExists = await getMotorcycleByChassis(chassis);
        if (chassiExists) {
          return {
            status: "error",
            message: "Este chassi já está cadastrado em outra motocicleta.",
          };
        }
      }

      await updateMotorcycle(motorcycle.id, {
        chassi: chassis,
        model,
        forecastArrival: forecastDate ?? null,
        registrationStatus:
          registrationStatus === "Emplacado"
            ? "PLATED"
            : registrationStatus === "Emplacando"
              ? "PLATING"
              : "NO_PLATE",
        registrationDate: registrationDate ?? null,
      });
    }

    if (newChassis) {
      const existingMotorcycle = await getMotorcycleByChassis(newChassis);
      if (existingMotorcycle) {
        await prisma.motorcycle.update({
          where: { id: existingMotorcycle.id },
          data: { clientId },
        });
      } else {
        await createMotorcycle({
          chassi: newChassis,
          model: newModel ?? "",
          forecastArrival: newForecastDate ?? null,
          clientId,
        });
      }
    }

    revalidatePath("/bdc");
    revalidatePath("/tracking", "layout");
  } catch (error) {
    console.error("Erro ao editar cliente:", error);
    return {
      status: "error",
      message: "Erro interno ao atualizar os dados do cliente.",
    };
  }

  redirect("/bdc");
}

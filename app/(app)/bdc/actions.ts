"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/app/data/user/require-auth";
import { stripCPF } from "@/lib/cpf";
import {
  createClientsBatch,
  getAllClientsForImport,
  getBDCFilterOptions,
  getClientByCpf,
  getClientById,
  getClientsPaginated,
  updateClient,
} from "@/lib/data/client";
import {
  createMotorcycle,
  createMotorcyclesBatch,
  getAllMotorcyclesForImport,
  getMotorcycleByChassis,
  linkMotorcyclesBatch,
  updateMotorcycle,
} from "@/lib/data/motorcycle";
import { prisma } from "@/lib/db";
import type { ArrivalStatusValue } from "@/lib/bdc-data";
import type { ApiResponse } from "@/lib/types";
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
      arrivalStatus,
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

      const arrivalStatusMap: Record<
        string,
        "NO_INFORMATION" | "ARRIVED" | "DELAYED"
      > = {
        "Sem Informação": "NO_INFORMATION",
        Chegou: "ARRIVED",
        Atrasada: "DELAYED",
      };

      await updateMotorcycle(motorcycle.id, {
        chassi: chassis,
        model,
        forecastArrival: forecastDate ?? null,
        forecastArrivalStatus:
          arrivalStatusMap[arrivalStatus ?? ""] ?? "NO_INFORMATION",
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

function parseDateStringDDMMAAA(value: string | null): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

interface ImportRow {
  chassi: string;
  cliente: string;
  consultor: string;
  cpf: string;
  modelo: string;
  cidade: string;
  faturamento: string | null;
}

export async function importSpreadsheetAction(
  rows: ImportRow[],
): Promise<{ status: "success" | "error"; message: string }> {
  await requireAuth();

  try {
    console.log("[import] Iniciando importação de", rows.length, "linhas");

    const [existingClients, existingMotorcycles] = await Promise.all([
      getAllClientsForImport(),
      getAllMotorcyclesForImport(),
    ]);

    console.log(
      "[import] Clientes existentes:",
      existingClients.length,
      "Motos existentes:",
      existingMotorcycles.length,
    );

    const clientByCpf = new Map(
      existingClients.map((c) => [c.cpf, c]),
    );
    const motoByChassi = new Map(
      existingMotorcycles.map((m) => [m.chassi, m]),
    );

    const newClients: Array<{
      cpf: string;
      name: string;
      sellerName: string;
      city: string;
      billingDate: Date | null;
    }> = [];

    const billingDateUpdates: Array<{
      cpf: string;
      billingDate: Date;
    }> = [];

    const newMotorcycles: Array<{
      chassi: string;
      model: string;
      clientCpf: string;
    }> = [];

    const linkMotorcycles: Array<{
      chassi: string;
      clientCpf: string;
    }> = [];

    const newCpfs = new Set<string>();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      try {
        const cpf = row.cpf
          ? stripCPF(row.cpf)
          : `TEMP-${row.chassi.toUpperCase()}`;

        const existingClient = clientByCpf.get(cpf);

        if (!existingClient && !newCpfs.has(cpf)) {
          newCpfs.add(cpf);
          const billingDate = parseDateStringDDMMAAA(row.faturamento);
          newClients.push({
            cpf,
            name: row.cliente,
            sellerName: row.consultor,
            city: row.cidade,
            billingDate,
          });
        } else if (existingClient) {
          const billingDate = parseDateStringDDMMAAA(row.faturamento);
          if (billingDate && !existingClient.billingDate) {
            billingDateUpdates.push({ cpf, billingDate });
          }
        }

        const existingMoto = motoByChassi.get(row.chassi);

        if (existingMoto) {
          if (!existingMoto.clientId) {
            linkMotorcycles.push({ chassi: row.chassi, clientCpf: cpf });
          }
          updated++;
        } else {
          newMotorcycles.push({
            chassi: row.chassi,
            model: row.modelo,
            clientCpf: cpf,
          });
          created++;
        }
      } catch (err) {
        console.error("[import] Erro ao processar linha", row.chassi, err);
        skipped++;
      }
    }

    console.log(
      "[import] Classificação:",
      { newClients: newClients.length, newMotorcycles: newMotorcycles.length, linkMotorcycles: linkMotorcycles.length, billingDateUpdates: billingDateUpdates.length, skipped },
    );

    if (newClients.length > 0) {
      console.log("[import] Criando", newClients.length, "clientes em batch");
    }
    const createdClients = newClients.length > 0
      ? await createClientsBatch(newClients)
      : [];

    const clientIdByCpf = new Map<string, string>();
    for (const c of existingClients) clientIdByCpf.set(c.cpf, c.id);
    for (const c of createdClients) clientIdByCpf.set(c.cpf, c.id);

    if (newMotorcycles.length > 0) {
      console.log("[import] Criando", newMotorcycles.length, "motos em batch");
      await createMotorcyclesBatch(
        newMotorcycles.map((m) => ({
          chassi: m.chassi,
          model: m.model,
          clientId: clientIdByCpf.get(m.clientCpf),
        })),
      );
    }

    if (linkMotorcycles.length > 0) {
      const links = linkMotorcycles
        .map((l) => ({
          chassi: l.chassi,
          clientId: clientIdByCpf.get(l.clientCpf),
        }))
        .filter((l): l is { chassi: string; clientId: string } => !!l.clientId);

      if (links.length > 0) {
        console.log("[import] Vinculando", links.length, "motos existentes");
        await linkMotorcyclesBatch(links);
      }
    }

    if (billingDateUpdates.length > 0) {
      console.log("[import] Atualizando", billingDateUpdates.length, "billingDates");
      await prisma.$transaction(
        billingDateUpdates.map((u) =>
          prisma.client.update({
            where: { cpf: u.cpf },
            data: { billingDate: u.billingDate },
          }),
        ),
      );
    }

    const parts: string[] = [];
    if (created > 0)
      parts.push(
        `${created} moto${created > 1 ? "s" : ""} criada${created > 1 ? "s" : ""}`,
      );
    if (updated > 0)
      parts.push(
        `${updated} moto${updated > 1 ? "s" : ""} atualizada${updated > 1 ? "s" : ""}`,
      );
    if (skipped > 0)
      parts.push(
        `${skipped} linha${skipped > 1 ? "s" : ""} ignorada${skipped > 1 ? "s" : ""}`,
      );

    revalidatePath("/bdc");

    return {
      status: "success",
      message: `Importação concluída. ${parts.join(", ")}.`,
    };
  } catch (err) {
    console.error("[import] Erro fatal:", err);
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Erro interno ao importar planilha.",
    };
  }
}

export type ClientRow = {
  id: string;
  cpf: string;
  name: string;
  sellersName: string;
  city: string;
  billingDate: Date | null;
  motorcycle: {
    id: string;
    chassi: string;
    model: string;
    forecastArrival: Date | null;
    forecastArrivalStatus: ArrivalStatusValue;
    registrationStatus: string | null;
    registrationDate: Date | null;
  } | null;
  rowKey: string;
};

export interface PaginatedResult {
  rows: ClientRow[];
  totalClients: number;
  totalPages: number;
  page: number;
  filterOptions: {
    sellers: string[];
    cities: string[];
    models: string[];
  };
}

export async function getClientsPaginatedAction(params: {
  page: number;
  pageSize?: number;
  sellerName?: string;
  city?: string;
  model?: string;
}): Promise<PaginatedResult> {
  await requireAuth();

  const pageSize = params.pageSize ?? 10;

  const [paginated, filterOptions] = await Promise.all([
    getClientsPaginated({
      page: params.page,
      pageSize,
      sellerName: params.sellerName,
      city: params.city,
      model: params.model,
    }),
    getBDCFilterOptions(),
  ]);

  const rows: ClientRow[] = paginated.clients.flatMap((client): ClientRow[] => {
    if (client.motorcycles.length === 0) {
      return [
        {
          id: client.id,
          cpf: client.cpf,
          name: client.name,
          sellersName: client.sellersName,
          city: client.city,
          billingDate: client.billingDate,
          motorcycle: null,
          rowKey: `${client.id}-none`,
        },
      ];
    }
    return client.motorcycles.map((motorcycle) => ({
      id: client.id,
      cpf: client.cpf,
      name: client.name,
      sellersName: client.sellersName,
      city: client.city,
      billingDate: client.billingDate,
      motorcycle: {
        id: motorcycle.id,
        chassi: motorcycle.chassi,
        model: motorcycle.model,
        forecastArrival: motorcycle.forecastArrival,
        forecastArrivalStatus: motorcycle.forecastArrivalStatus as ArrivalStatusValue,
        registrationStatus: motorcycle.registrationStatus,
        registrationDate: motorcycle.registrationDate,
      },
      rowKey: `${client.id}-${motorcycle.id}`,
    }));
  });

  return {
    rows,
    totalClients: paginated.total,
    totalPages: paginated.totalPages,
    page: params.page,
    filterOptions: {
      sellers: filterOptions.sellers,
      cities: filterOptions.cities,
      models: filterOptions.models,
    },
  };
}

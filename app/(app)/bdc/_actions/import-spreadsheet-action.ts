"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/app/data/user/require-auth";
import { stripCPF } from "@/lib/cpf";
import { prisma } from "@/lib/db";
import { parseDateStringDDMMAAAA } from "../_lib/date-utils";

interface ImportRow {
  chassi: string;
  cliente: string;
  consultor: string;
  cpf: string;
  modelo: string;
  cidade: string;
  faturamento: string | null;
}

interface ImportResult {
  status: "success" | "error";
  message: string;
}

interface ImportCounters {
  created: number;
  linked: number;
  updated: number;
  skipped: number;
}

function normalizeChassis(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeCpf(value: string, chassis: string): string {
  return value.trim() ? stripCPF(value) : `TEMP-${chassis}`;
}

function buildImportMessage(counters: ImportCounters): string {
  const parts: string[] = [];

  if (counters.created > 0) {
    parts.push(
      `${counters.created} moto${counters.created === 1 ? "" : "s"} criada${counters.created === 1 ? "" : "s"}`,
    );
  }

  if (counters.updated > 0) {
    parts.push(
      `${counters.updated} moto${counters.updated === 1 ? "" : "s"} atualizada${counters.updated === 1 ? "" : "s"}`,
    );
  }

  if (counters.linked > 0) {
    parts.push(
      `${counters.linked} moto${counters.linked === 1 ? "" : "s"} vinculada${counters.linked === 1 ? "" : "s"}`,
    );
  }

  if (counters.skipped > 0) {
    parts.push(
      `${counters.skipped} linha${counters.skipped === 1 ? "" : "s"} ignorada${counters.skipped === 1 ? "" : "s"}`,
    );
  }

  return parts.length > 0
    ? `Importação concluída. ${parts.join(", ")}.`
    : "Importação concluída. Nenhuma alteração necessária.";
}

export async function importSpreadsheetAction(
  rows: ImportRow[],
): Promise<ImportResult> {
  await requireAuth();

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      status: "error",
      message: "A planilha não contém linhas para importar.",
    };
  }

  if (rows.length > 10_000) {
    return {
      status: "error",
      message: "A importação está limitada a 10.000 linhas por vez.",
    };
  }

  try {
    const counters: ImportCounters = {
      created: 0,
      linked: 0,
      updated: 0,
      skipped: 0,
    };

    await prisma.$transaction(
      async (tx) => {
        const [clients, motorcycles] = await Promise.all([
          tx.client.findMany({
            select: {
              id: true,
              cpf: true,
              billingDate: true,
            },
          }),
          tx.motorcycle.findMany({
            select: {
              id: true,
              chassi: true,
              model: true,
              clientId: true,
            },
          }),
        ]);

        const clientByCpf = new Map(
          clients.map((client) => [client.cpf, client]),
        );

        const motorcycleByChassis = new Map(
          motorcycles.map((motorcycle) => [
            normalizeChassis(motorcycle.chassi),
            motorcycle,
          ]),
        );

        for (const row of rows) {
          const chassis = normalizeChassis(row.chassi ?? "");

          if (!chassis || !row.cliente?.trim() || !row.modelo?.trim()) {
            counters.skipped++;
            continue;
          }

          const cpf = normalizeCpf(row.cpf ?? "", chassis);
          const billingDate = parseDateStringDDMMAAAA(row.faturamento ?? null);

          let client = clientByCpf.get(cpf);

          if (!client) {
            client = await tx.client.create({
              data: {
                cpf,
                name: row.cliente.trim(),
                sellersName: row.consultor?.trim() ?? "",
                city: row.cidade?.trim() ?? "",
                billingDate,
              },
              select: {
                id: true,
                cpf: true,
                billingDate: true,
              },
            });

            clientByCpf.set(cpf, client);
          } else if (billingDate && !client.billingDate) {
            client = await tx.client.update({
              where: { id: client.id },
              data: { billingDate },
              select: {
                id: true,
                cpf: true,
                billingDate: true,
              },
            });

            clientByCpf.set(cpf, client);
          }

          const model = row.modelo.trim();
          const existingMotorcycle = motorcycleByChassis.get(chassis);

          if (!existingMotorcycle) {
            const createdMotorcycle = await tx.motorcycle.create({
              data: {
                chassi: chassis,
                model,
                clientId: client.id,
              },
              select: {
                id: true,
                chassi: true,
                model: true,
                clientId: true,
              },
            });

            motorcycleByChassis.set(chassis, createdMotorcycle);
            counters.created++;
            continue;
          }

          let changed = false;

          if (!existingMotorcycle.clientId) {
            await tx.motorcycle.update({
              where: { id: existingMotorcycle.id },
              data: { clientId: client.id },
            });

            existingMotorcycle.clientId = client.id;
            counters.linked++;
            changed = true;
          }

          if (
            existingMotorcycle.model !== model &&
            existingMotorcycle.clientId === client.id
          ) {
            await tx.motorcycle.update({
              where: { id: existingMotorcycle.id },
              data: { model },
            });

            existingMotorcycle.model = model;
            counters.updated++;
            changed = true;
          }

          if (!changed) {
            counters.skipped++;
          }
        }
      },
      {
        maxWait: 10_000,
        timeout: 120_000,
      },
    );

    revalidatePath("/bdc");
    revalidatePath("/inventory");
    revalidatePath("/tracking", "layout");

    return {
      status: "success",
      message: buildImportMessage(counters),
    };
  } catch (error) {
    console.error("[import] Erro ao importar planilha:", error);

    return {
      status: "error",
      message:
        error instanceof Error && error.message.includes("Unique constraint")
          ? "Foi encontrado um CPF ou chassi duplicado. Confira os dados da planilha e tente novamente."
          : "Não foi possível concluir a importação. Nenhuma alteração da transação foi confirmada.",
    };
  }
}

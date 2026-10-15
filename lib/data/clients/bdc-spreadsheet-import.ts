import "server-only";

import { prisma } from "@/lib/db";
import { normalizeDocument, validateDocument } from "@/lib/document";

export interface BDCSpreadsheetRow {
  chassi: string;
  cliente: string;
  consultor: string;
  document: string;
  modelo: string;
  cidade: string;
  faturamento: string | null;
}

export interface BDCSpreadsheetImportCounts {
  created: number;
  linked: number;
  updated: number;
  skipped: number;
}

function parseImportDate(value: string | null): Date | null {
  if (!value?.trim()) return null;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const [, day, month, year] = match;
  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  const date = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber, 3));

  return date.getUTCDate() === dayNumber &&
    date.getUTCMonth() === monthNumber - 1 &&
    date.getUTCFullYear() === yearNumber
    ? date
    : null;
}

export async function importBDCSpreadsheet(
  rows: BDCSpreadsheetRow[],
): Promise<BDCSpreadsheetImportCounts> {
  const counts: BDCSpreadsheetImportCounts = {
    created: 0,
    linked: 0,
    updated: 0,
    skipped: 0,
  };

  await prisma.$transaction(
    async (tx) => {
      const [clients, motorcycles] = await Promise.all([
        tx.client.findMany({
          select: { id: true, document: true, billingDate: true },
        }),
        tx.motorcycle.findMany({
          select: { id: true, chassi: true, model: true, clientId: true },
        }),
      ]);

      const clientByCpf = new Map(
        clients.map((client) => [client.document, client]),
      );
      const motorcycleByChassis = new Map(
        motorcycles.map((motorcycle) => [
          motorcycle.chassi.trim().toUpperCase(),
          motorcycle,
        ]),
      );

      for (const row of rows) {
        const chassis = row.chassi?.trim().toUpperCase() ?? "";
        const name = row.cliente?.trim() ?? "";
        const model = row.modelo?.trim() ?? "";

        if (!chassis || !name || !model) {
          counts.skipped++;
          continue;
        }

        if (row.document?.trim() && !validateDocument(row.document)) {
          counts.skipped++;
          continue;
        }
        const document = row.document?.trim()
          ? normalizeDocument(row.document)
          : `TEMP-${chassis}`;
        const billingDate = parseImportDate(row.faturamento ?? null);
        let client = clientByCpf.get(document);

        if (!client) {
          client = await tx.client.create({
            data: {
              document,
              name,
              sellersName: row.consultor?.trim() ?? "",
              city: row.cidade?.trim() ?? "",
              billingDate,
            },
            select: { id: true, document: true, billingDate: true },
          });
          clientByCpf.set(document, client);
        } else if (billingDate && !client.billingDate) {
          client = await tx.client.update({
            where: { id: client.id },
            data: { billingDate },
            select: { id: true, document: true, billingDate: true },
          });
          clientByCpf.set(document, client);
        }

        const existingMotorcycle = motorcycleByChassis.get(chassis);
        if (!existingMotorcycle) {
          const createdMotorcycle = await tx.motorcycle.create({
            data: { chassi: chassis, model, clientId: client.id },
            select: { id: true, chassi: true, model: true, clientId: true },
          });
          motorcycleByChassis.set(chassis, createdMotorcycle);
          counts.created++;
          continue;
        }

        let changed = false;
        if (!existingMotorcycle.clientId) {
          await tx.motorcycle.update({
            where: { id: existingMotorcycle.id },
            data: { clientId: client.id },
          });
          existingMotorcycle.clientId = client.id;
          counts.linked++;
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
          counts.updated++;
          changed = true;
        }

        if (!changed) counts.skipped++;
      }
    },
    { maxWait: 10_000, timeout: 120_000 },
  );

  return counts;
}

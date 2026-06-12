"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { requireAuth } from "@/app/data/require-user";
import { parseExcelDate } from "@/lib/bdc-data";
import {
  createClientsBatch,
  deleteClient as dalDeleteClient,
  getClients as dalGetClients,
  searchClients as dalSearchClients,
  getAllClientsForImport,
} from "@/lib/data/client";
import {
  createMotorcyclesBatch,
  getMotorcycleByChassis,
  linkMotorcyclesBatch,
  updateMotorcyclesBatch,
} from "@/lib/data/motorcycle";

function findSheet(
  workbook: XLSX.WorkBook,
  names: string[],
): XLSX.WorkSheet | undefined {
  for (const name of names) {
    const sheet = workbook.Sheets[name];
    if (sheet) return sheet;
  }
  return undefined;
}

function detectColumn(
  row: Record<string, unknown>,
  candidates: string[],
): unknown {
  for (const key of Object.keys(row)) {
    const upper = key.trim().toUpperCase();
    for (const candidate of candidates) {
      if (upper === candidate) return row[key];
    }
  }
  return undefined;
}

const CHASSIS_KEYS = ["CHASSI", "CHASSIS", "Nº CHASSI", "CHASSI MOTO"];
const CLIENT_NAME_KEYS = ["CLIENTE", "NOME", "NOME CLIENTE"];
const SELLER_KEYS = ["VENDEDOR", "VENDEDOR RESPONSÁVEL"];
const CITY_KEYS = ["CIDADE", "MUNICÍPIO", "CIDADE CLIENTE"];
const MODEL_KEYS = ["MODELO", "MODELO MOTO", "MODELO MOTOCICLETA"];
const BILLING_DATE_KEYS = [
  "DATA DO FATURAMENTO",
  "DATA DE FATURAMENTO",
  "DATA FATURAMENTO",
  "DT FATURAMENTO",
];
const HAS_ARRIVED_KEYS = [
  "MOTO CHEGOU NA MATRIZ (SIM / NÃO)",
  "MOTO CHEGOU",
  "CHEGOU",
  "CHEGOU NA MATRIZ",
];
const ARRIVAL_DATE_KEYS = [
  "DATA CHEGADA",
  "DATA DE CHEGADA",
  "DATA DA CHEGADA",
  "DT CHEGADA",
  "CHEGADA",
  "DATA DE CHEGADA NA MATRIZ",
];

export async function getClientsAction() {
  await requireAuth();
  return dalGetClients();
}

export async function searchChassisAction(chassis: string) {
  await requireAuth();
  return getMotorcycleByChassis(chassis);
}

export async function searchClientsAction(query: string) {
  await requireAuth();
  return dalSearchClients(query);
}

export async function deleteClientAction(id: string) {
  await requireAuth();

  try {
    await dalDeleteClient(id);

    revalidatePath("/bdc");
    revalidatePath("/logistica");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao remover cliente." };
  }
}

function readMainSheet(workbook: XLSX.WorkBook): Record<string, unknown>[] {
  const sheetNames = ["Página1", "Plan1", "Planilha1"];
  const sheet =
    findSheet(workbook, sheetNames) ?? workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { range: 1 });
}

function readArrivalSheet(
  workbook: XLSX.WorkBook,
): Map<string, { forecastDate: Date | null }> {
  const sheetNames = ["Página2", "Plan2", "Planilha2"];
  const sheet = findSheet(workbook, sheetNames);
  if (!sheet) return new Map();

  const rows = XLSX.utils.sheet_to_json(sheet, { range: 1 }) as Record<
    string,
    unknown
  >[];
  const map = new Map<string, { forecastDate: Date | null }>();

  for (const row of rows) {
    const chassisRaw = detectColumn(row, CHASSIS_KEYS);
    if (!chassisRaw) continue;

    const chassis = String(chassisRaw).trim().toUpperCase();
    if (!chassis) continue;

    const forecastDateRaw = detectColumn(row, ARRIVAL_DATE_KEYS);
    const forecastDate = parseExcelDate(forecastDateRaw);

    map.set(chassis, { forecastDate: forecastDate ?? null });
  }

  return map;
}

export async function importSpreadsheetAction(formData: FormData) {
  await requireAuth();

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "Nenhum arquivo enviado." };
  }

  const allowedExtensions = [".xlsx", ".xls", ".ods", ".csv"];
  const fileName = file.name.toLowerCase();
  const isValid = allowedExtensions.some((ext) => fileName.endsWith(ext));

  if (!isValid) {
    return { success: false, error: "Formato de arquivo não suportado." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { cellDates: true });
    const json = readMainSheet(workbook);
    const arrivalMap = readArrivalSheet(workbook);

    const existingClients = await getAllClientsForImport();
    const existingMotorcycles = await (
      await import("@/lib/data/motorcycle")
    ).getAllMotorcyclesForImport();

    const clientMap = new Map<
      string,
      { id: string; name: string; sellerName: string }
    >();
    for (const c of existingClients) {
      const key = `${c.name.toLowerCase()}|${c.sellerName.toLowerCase()}`;
      clientMap.set(key, c);
    }

    const motorcycleMap = new Map<
      string,
      {
        id: string;
        chassis: string;
        forecastDate: Date | null;
        clientId: string | null;
      }
    >();
    for (const m of existingMotorcycles) {
      motorcycleMap.set(m.chassis, m);
    }

    const clientsToCreate: Array<{
      name: string;
      sellerName: string;
      city: string;
      billingDate?: Date | null;
    }> = [];
    const motorcyclesToCreate: Array<{
      chassis: string;
      model: string;
      forecastDate?: Date | null;
      registrationStatus: "NO_PLATE";
      clientId?: string;
    }> = [];
    const motorcyclesToUpdate: Array<{ chassis: string; forecastDate: Date }> =
      [];
    const motorcyclesToLink: Array<{ chassis: string; clientId: string }> = [];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    const processedRows: Array<{
      clientKey: string;
      clientName: string;
      sellerName: string;
      city: string;
      billingDate?: Date | null;
      chassis: string;
      model: string;
      forecastDate: Date | null;
    }> = [];

    for (const row of json as Record<string, unknown>[]) {
      const clientName = detectColumn(row, CLIENT_NAME_KEYS);
      const chassis = detectColumn(row, CHASSIS_KEYS);
      const sellerName = detectColumn(row, SELLER_KEYS);

      if (!chassis || !clientName || !sellerName) {
        skipped++;
        continue;
      }

      const chassisStr = String(chassis).trim().toUpperCase();
      const nameStr = String(clientName);
      const sellerStr = String(sellerName);
      const city = String(detectColumn(row, CITY_KEYS) ?? "");
      const model = String(detectColumn(row, MODEL_KEYS) ?? "");

      const billingDateRaw = detectColumn(row, BILLING_DATE_KEYS);
      const billingDate = parseExcelDate(billingDateRaw);

      const arrivalInfo = arrivalMap.get(chassisStr);
      const hasArrivedRaw = detectColumn(row, HAS_ARRIVED_KEYS);
      const hasArrivedFromMainSheet =
        typeof hasArrivedRaw === "string"
          ? hasArrivedRaw.trim().toUpperCase() === "SIM"
          : false;

      let forecastDate: Date | null = null;
      if (arrivalInfo?.forecastDate) {
        forecastDate = arrivalInfo.forecastDate;
      } else if (hasArrivedFromMainSheet) {
        forecastDate = new Date();
      }

      const clientKey = `${nameStr.toLowerCase()}|${sellerStr.toLowerCase()}`;

      processedRows.push({
        clientKey,
        clientName: nameStr,
        sellerName: sellerStr,
        city,
        billingDate,
        chassis: chassisStr,
        model,
        forecastDate,
      });
    }

    const newClientKeys = new Set<string>();
    for (const row of processedRows) {
      if (!clientMap.has(row.clientKey) && !newClientKeys.has(row.clientKey)) {
        newClientKeys.add(row.clientKey);
        clientsToCreate.push({
          name: row.clientName,
          sellerName: row.sellerName,
          city: row.city,
          billingDate: row.billingDate,
        });
      }
    }

    if (clientsToCreate.length > 0) {
      const createdClients = await createClientsBatch(clientsToCreate);
      for (const c of createdClients) {
        const key = `${c.name.toLowerCase()}|${c.sellerName.toLowerCase()}`;
        clientMap.set(key, c);
      }
    }

    for (const row of processedRows) {
      const client = clientMap.get(row.clientKey);
      if (!client) continue;

      const existingMoto = motorcycleMap.get(row.chassis);

      if (existingMoto) {
        if (row.forecastDate && !existingMoto.forecastDate) {
          motorcyclesToUpdate.push({
            chassis: row.chassis,
            forecastDate: row.forecastDate,
          });
          existingMoto.forecastDate = row.forecastDate;
          updated++;
        }

        if (!existingMoto.clientId || existingMoto.clientId !== client.id) {
          motorcyclesToLink.push({ chassis: row.chassis, clientId: client.id });
          existingMoto.clientId = client.id;
        }
      } else {
        motorcyclesToCreate.push({
          chassis: row.chassis,
          model: row.model,
          forecastDate: row.forecastDate,
          registrationStatus: "NO_PLATE",
          clientId: client.id,
        });
        motorcycleMap.set(row.chassis, {
          id: "",
          chassis: row.chassis,
          forecastDate: row.forecastDate,
          clientId: client.id,
        });
        created++;
      }
    }

    await createMotorcyclesBatch(motorcyclesToCreate);
    await updateMotorcyclesBatch(motorcyclesToUpdate);
    await linkMotorcyclesBatch(motorcyclesToLink);

    const success = processedRows.length;

    revalidatePath("/bdc");
    revalidatePath("/logistica");

    return {
      success: true,
      message: `${success} linhas processadas: ${created} criadas, ${updated} atualizadas, ${skipped} puladas`,
      stats: { success, created, updated, skipped },
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro ao processar arquivo: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

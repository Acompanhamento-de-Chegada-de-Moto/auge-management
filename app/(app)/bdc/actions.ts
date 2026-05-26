"use server";

import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";
import { requireAuth } from "@/app/data/require-user";
import { parseExcelDate } from "@/lib/bdc-data";
import {
  createClient,
  deleteClient as dalDeleteClient,
  getClients as dalGetClients,
  getClientByNameAndSeller,
} from "@/lib/data/client";
import {
  createMotorcycle,
  getMotorcycleByChassis,
  linkMotorcycleToClient,
  updateMotorcycleByChassis,
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

const CHASSI_KEYS = ["CHASSI", "CHASSIS", "Nº CHASSI", "CHASSI MOTO"];
const CLIENTE_KEYS = ["CLIENTE", "NOME", "NOME CLIENTE"];
const VENDEDOR_KEYS = ["VENDEDOR", "VENDEDOR RESPONSÁVEL"];
const CIDADE_KEYS = ["CIDADE", "MUNICÍPIO", "CIDADE CLIENTE"];
const MODELO_KEYS = ["MODELO", "MODELO MOTO", "MODELO MOTOCICLETA"];
const DATA_FATURAMENTO_KEYS = [
  "DATA DO FATURAMENTO",
  "DATA DE FATURAMENTO",
  "DATA FATURAMENTO",
  "DT FATURAMENTO",
];
const MOTO_CHEGOU_KEYS = [
  "MOTO CHEGOU NA MATRIZ (SIM / NÃO)",
  "MOTO CHEGOU",
  "CHEGOU",
  "CHEGOU NA MATRIZ",
];
const DATA_CHEGADA_KEYS = [
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

export async function deleteClientAction(id: string) {
  await requireAuth();

  try {
    await dalDeleteClient(id);

    revalidatePath("/bdc");
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao remover cliente." };
  }
}

function readPagina1(workbook: XLSX.WorkBook): Record<string, unknown>[] {
  const sheetNames = ["Página1", "Plan1", "Planilha1"];
  const sheet =
    findSheet(workbook, sheetNames) ?? workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { range: 1 });
}

function readPagina2(
  workbook: XLSX.WorkBook,
): Map<string, { arrivalDate: Date | null }> {
  const sheetNames = ["Página2", "Plan2", "Planilha2"];
  const sheet = findSheet(workbook, sheetNames);
  if (!sheet) return new Map();

  const rows = XLSX.utils.sheet_to_json(sheet, { range: 1 }) as Record<
    string,
    unknown
  >[];
  const map = new Map<string, { arrivalDate: Date | null }>();

  for (const row of rows) {
    const chassisRaw = detectColumn(row, CHASSI_KEYS);
    if (!chassisRaw) continue;

    const chassis = String(chassisRaw).trim().toUpperCase();
    if (!chassis) continue;

    const dataChegadaRaw = detectColumn(row, DATA_CHEGADA_KEYS);
    const dataChegada = parseExcelDate(dataChegadaRaw);

    map.set(chassis, { arrivalDate: dataChegada ?? null });
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
    const json = readPagina1(workbook);
    const chegadaMap = readPagina2(workbook);

    let success = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of json as Record<string, unknown>[]) {
      const cliente = detectColumn(row, CLIENTE_KEYS);
      const chassi = detectColumn(row, CHASSI_KEYS);
      const vendedor = detectColumn(row, VENDEDOR_KEYS);

      if (!chassi || !cliente || !vendedor) {
        skipped++;
        continue;
      }

      const chassis = String(chassi).trim().toUpperCase();
      const clientName = String(cliente);
      const sellerName = String(vendedor);
      const city = String(detectColumn(row, CIDADE_KEYS) ?? "");
      const model = String(detectColumn(row, MODELO_KEYS) ?? "");

      const dataFaturamentoRaw = detectColumn(row, DATA_FATURAMENTO_KEYS);
      const billingDate = parseExcelDate(dataFaturamentoRaw);

      // Arrival: Página2 has priority, fallback to Página1 "MOTO CHEGOU" column
      const chegadaInfo = chegadaMap.get(chassis);
      const motoChegouRaw = detectColumn(row, MOTO_CHEGOU_KEYS);
      const motoChegouPagina1 =
        typeof motoChegouRaw === "string"
          ? motoChegouRaw.trim().toUpperCase() === "SIM"
          : false;

      let arrivalDate: Date | null = null;

      if (chegadaInfo?.arrivalDate) {
        arrivalDate = chegadaInfo.arrivalDate;
      } else if (motoChegouPagina1) {
        arrivalDate = new Date();
      }

      let existingClient = await getClientByNameAndSeller(
        clientName,
        sellerName,
      );

      if (!existingClient) {
        existingClient = await createClient({
          name: clientName,
          sellerName: sellerName,
          city: city,
          billingDate,
        });
      }

      const existingMoto = await getMotorcycleByChassis(chassis);

      if (existingMoto) {
        if (arrivalDate && !existingMoto.arrivalDate) {
          await updateMotorcycleByChassis(chassis, {
            arrivalDate,
          });
          updated++;
        }

        if (
          !existingMoto.clientId ||
          existingMoto.clientId !== existingClient.id
        ) {
          await linkMotorcycleToClient(chassis, existingClient.id);
        }
      } else {
        await createMotorcycle({
          chassis,
          model,
          arrivalDate,
          registrationStatus: "PENDING",
          clientId: existingClient.id,
        });
        created++;
      }

      success++;
    }

    revalidatePath("/bdc");

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

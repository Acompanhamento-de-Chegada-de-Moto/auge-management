"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/app/data/require-user";
import * as XLSX from "xlsx";
import {
  createClient,
  getClientByNameAndSeller,
  deleteClient as dalDeleteClient,
  getClientById as dalGetClientById,
  getClients as dalGetClients,
} from "@/lib/data/client";
import {
  createMotorcycle,
  getMotorcycleByChassis,
  updateMotorcycleByChassis,
  linkMotorcycleToClient,
} from "@/lib/data/motorcycle";
import { parseExcelDate } from "@/lib/bdc-data";


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
    const workbook = XLSX.read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet, { range: 1 });

    let success = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of json as any[]) {
      const item = {
        cliente: row["CLIENTE"],
        dataFaturamento: row["DATA DO FATURAMENTO"],
        modelo: row["MODELO"],
        chassi: row["CHASSI"],
        vendedor: row["VENDEDOR"],
        cidade: row["CIDADE"],
        motoChegou: row["MOTO CHEGOU NA MATRIZ (SIM / NÃO)"]?.toUpperCase() === "SIM",
      };

      if (!item.chassi || !item.cliente || !item.vendedor) {
        skipped++;
        continue;
      }

      const chassis = String(item.chassi).trim().toUpperCase();
      const clientName = String(item.cliente);
      const sellerName = String(item.vendedor);
      const city = String(item.cidade);
      const model = String(item.modelo);
      const billingDate = parseExcelDate(item.dataFaturamento);

      let existingClient = await getClientByNameAndSeller(clientName, sellerName);

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
        if (item.motoChegou && !existingMoto.arrivalDate) {
          await updateMotorcycleByChassis(chassis, {
            arrivalDate: new Date(),
          });
          updated++;
        }

        if (!existingMoto.clientId || existingMoto.clientId !== existingClient.id) {
          await linkMotorcycleToClient(chassis, existingClient.id);
        }
      } else {
        await createMotorcycle({
          chassis,
          model,
          arrivalDate: item.motoChegou ? new Date() : null,
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

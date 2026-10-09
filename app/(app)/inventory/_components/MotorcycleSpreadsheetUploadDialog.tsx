"use client";

import * as XLSX from "xlsx";
import { importMotorcyclesAction } from "@/app/(app)/inventory/import-actions";
import { SpreadsheetImportDialog } from "@/components/SpreadsheetImportDialog";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function parseDateValue(value: unknown): Date | null {
  if (value == null || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d);
    }
  }

  const text = String(value).trim();
  if (!text) return null;

  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseSpreadsheet(file: File): Promise<{
  rows: Array<{
    chassis: string;
    model: string;
    date: Date | null;
  }>;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const targetSheetName = workbook.SheetNames.find(
          (sheetName) => normalizeText(sheetName) === "PAGINA2",
        );

        if (!targetSheetName) {
          reject(new Error('A aba "Página2" não foi encontrada.'));
          return;
        }

        const sheet = workbook.Sheets[targetSheetName];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, {
          header: 1,
          defval: "",
          blankrows: false,
        }) as string[][];

        if (json.length < 2) {
          reject(new Error("A aba Página2 está vazia ou sem cabeçalho."));
          return;
        }

        const headerRow = json[0].map((cell) => normalizeText(String(cell)));
        const dateIdx = headerRow.indexOf("DATA DE CHEGADA DA MOTO");
        const modelIdx = headerRow.indexOf("MODELO");
        const chassisIdx = headerRow.indexOf("CHASSI");

        if (dateIdx === -1 || modelIdx === -1 || chassisIdx === -1) {
          reject(
            new Error("Cabeçalhos esperados não encontrados na aba Página2."),
          );
          return;
        }

        const rows: Array<{
          chassis: string;
          model: string;
          date: Date | null;
        }> = [];

        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (
            !row ||
            row.every((cell) => !cell || String(cell).trim() === "")
          ) {
            continue;
          }

          const chassis = String(row[chassisIdx] ?? "").trim();
          if (!chassis) continue;

          rows.push({
            chassis,
            model: String(row[modelIdx] ?? "").trim(),
            date: parseDateValue(row[dateIdx]),
          });
        }

        resolve({ rows });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}

export function MotorcycleSpreadsheetUploadDialog() {
  return (
    <SpreadsheetImportDialog
      description="Envie a planilha usando a aba Página2 com as colunas: DATA DE CHEGADA, MODELO, CHASSI."
      emptyRowsMessage="Verifique se a aba Página2 tem a coluna CHASSI preenchida."
      parseFile={async (file) => (await parseSpreadsheet(file)).rows}
      importRows={importMotorcyclesAction}
    />
  );
}

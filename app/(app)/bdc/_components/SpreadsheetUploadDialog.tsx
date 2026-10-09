"use client";

import * as XLSX from "xlsx";
import { importSpreadsheetAction } from "../_actions/import-spreadsheet-action";
import { SpreadsheetImportDialog } from "@/components/SpreadsheetImportDialog";

const COLUMN_MAP: Record<string, string> = {
  CLIENTE: "cliente",
  FATURAMENTO: "faturamento",
  CPF: "cpf",
  MODELO: "modelo",
  CHASSI: "chassi",
  CONSULTOR: "consultor",
  VENDEDOR: "consultor",
  CIDADE: "cidade",
};

function parseDateDDMMAAA(value: unknown): string | null {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split("/");
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }

  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      const d = new Date(date.y, date.m - 1, date.d);
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    }
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getDate()).padStart(2, "0")}/${String(parsed.getMonth() + 1).padStart(2, "0")}/${parsed.getFullYear()}`;
  }

  return null;
}

function parseSpreadsheet(file: File): Promise<{
  rows: Array<{
    cliente: string;
    faturamento: string | null;
    cpf: string;
    modelo: string;
    chassi: string;
    consultor: string;
    cidade: string;
  }>;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, {
          header: 1,
          defval: "",
        }) as string[][];

        if (json.length < 2) {
          reject(new Error("Planilha vazia ou sem dados suficientes."));
          return;
        }

        const headerRow = json[1];
        const headers = headerRow.map((h: string) => {
          const trimmed = String(h).trim().toUpperCase();
          return COLUMN_MAP[trimmed] ?? trimmed;
        });

        const clienteIdx = headers.indexOf("cliente");
        const faturamentoIdx = headers.indexOf("faturamento");
        const cpfIdx = headers.indexOf("cpf");
        const modeloIdx = headers.indexOf("modelo");
        const chassiIdx = headers.indexOf("chassi");
        const consultorIdx = headers.indexOf("consultor");
        const cidadeIdx = headers.indexOf("cidade");

        const rows = [];
        for (let i = 2; i < json.length; i++) {
          const row = json[i];
          if (
            !row ||
            row.every((cell) => !cell || String(cell).trim() === "")
          ) {
            continue;
          }

          const chassi = String(row[chassiIdx] ?? "").trim();
          const cliente = String(row[clienteIdx] ?? "").trim();
          const consultor = String(row[consultorIdx] ?? "").trim();
          const cpf = String(row[cpfIdx] ?? "").trim();

          if (!chassi || !cliente || !consultor) continue;

          rows.push({
            chassi,
            cliente,
            consultor,
            cpf: cpf.replace(/\D/g, ""),
            modelo: String(row[modeloIdx] ?? "").trim(),
            cidade: String(row[cidadeIdx] ?? "").trim(),
            faturamento: parseDateDDMMAAA(row[faturamentoIdx]),
          });
        }

        resolve({ rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}

export function SpreadsheetUploadDialog() {
  return (
    <SpreadsheetImportDialog
      description="Envie uma planilha com os dados dos clientes. Formatos aceitos: Excel, LibreOffice ou CSV."
      emptyRowsMessage="Verifique se as colunas CLIENTE, CHASSI e CONSULTOR estão preenchidas."
      parseFile={async (file) => (await parseSpreadsheet(file)).rows}
      importRows={importSpreadsheetAction}
    />
  );
}

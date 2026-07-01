"use client";

import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { importMotorcyclesAction } from "@/app/(app)/inventory/import-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const ACCEPTED_TYPES = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
  "text/csv": [".csv"],
};

const COLUMN_MAP: Record<string, string> = {
  "DATA DE CHEGADA DE MOTO": "date",
  MODELO: "model",
  CHASSI: "chassis",
};

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split("/").map(Number);
    return new Date(y, m - 1, d);
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d);
    }
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
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
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetIndex = workbook.SheetNames.length > 1 ? 1 : 0;
        const sheetName = workbook.SheetNames[sheetIndex];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, {
          header: 1,
          defval: "",
        }) as string[][];

        if (json.length < 2) {
          reject(new Error("Planilha vazia ou sem dados suficientes."));
          return;
        }

        const headerRow = json[0];
        const headers = headerRow.map((h: string) => {
          const trimmed = String(h).trim().toUpperCase();
          return COLUMN_MAP[trimmed] ?? trimmed;
        });

        const dateIdx = headers.indexOf("date");
        const modelIdx = headers.indexOf("model");
        const chassisIdx = headers.indexOf("chassis");

        const rows = [];
        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.every((cell) => !cell || String(cell).trim() === "")) {
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
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsArrayBuffer(file);
  });
}

export function MotorcycleSpreadsheetUploadDialog() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const onDropRejected = useCallback(() => {
    toast.error("Formato inválido", {
      description: "Apenas arquivos Excel, LibreOffice ou CSV são permitidos.",
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  const handleRemove = () => {
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      let rows;
      try {
        const parsed = await parseSpreadsheet(file);
        rows = parsed.rows;
      } catch (parseErr) {
        console.error("Erro no parse da planilha:", parseErr);
        toast.error("Erro ao ler planilha", {
          description:
            parseErr instanceof Error
              ? parseErr.message
              : "Formato de arquivo não reconhecido.",
        });
        return;
      }

      if (rows.length === 0) {
        toast.error("Nenhuma linha válida encontrada", {
          description:
            "Verifique se a coluna CHASSI está preenchida.",
        });
        return;
      }

      const result = await importMotorcyclesAction(rows);

      if (result.status === "success") {
        toast.success("Importação concluída", {
          description: result.message,
        });
        setFile(null);
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Erro na importação", {
          description: result.message,
        });
      }
    } catch (actionErr) {
      console.error("Erro na server action:", actionErr);
      toast.error("Erro na importação", {
        description:
          actionErr instanceof Error
            ? actionErr.message
            : "Não foi possível processar o arquivo. Tente novamente.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 size-4" />
          Importar Planilha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Importar Planilha</DialogTitle>
          <DialogDescription>
            Envie uma planilha com os dados das motocicletas. Use a segunda aba
            (Página 2) com as colunas: DATA DE CHEGADA DE MOTO, MODELO, CHASSI.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-center rounded-full border p-3">
                <FileSpreadsheet className="size-6 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Solte o arquivo aqui"
                    : "Arraste e solte ou clique para selecionar"}
                </p>
                <p className="text-xs text-muted-foreground">
                  .xlsx, .xls, .ods, .csv (máx. 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileSpreadsheet className="size-5 shrink-0 text-muted-foreground" />
                <div className="flex flex-col overflow-hidden">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="size-4" />
                <span className="sr-only">Remover arquivo</span>
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setOpen(false);
            }}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Importando...
              </>
            ) : (
              "Importar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

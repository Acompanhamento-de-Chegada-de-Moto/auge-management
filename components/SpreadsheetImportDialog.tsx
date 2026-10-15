"use client";

import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import type { ApiResponse } from "@/lib/types";
import { ACCEPTED_SPREADSHEET_TYPES } from "@/lib/constants";
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

type SpreadsheetImportDialogProps<Row> = {
  description: string;
  emptyRowsMessage: string;
  parseFile: (file: File) => Promise<Row[]>;
  importRows: (rows: Row[]) => Promise<ApiResponse>;
};

export function SpreadsheetImportDialog<Row>({
  description,
  emptyRowsMessage,
  parseFile,
  importRows,
}: SpreadsheetImportDialogProps<Row>) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  }, []);

  const onDropRejected = useCallback(() => {
    toast.error("Formato inválido", {
      description: "Apenas arquivos Excel, LibreOffice ou CSV são permitidos.",
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: ACCEPTED_SPREADSHEET_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      let rows: Row[];
      try {
        rows = await parseFile(file);
      } catch (error) {
        console.error("Erro no parse da planilha:", error);
        toast.error("Erro ao ler planilha", {
          description:
            error instanceof Error
              ? error.message
              : "Formato de arquivo não reconhecido.",
        });
        return;
      }

      if (rows.length === 0) {
        toast.error("Nenhuma linha válida encontrada", {
          description: emptyRowsMessage,
        });
        return;
      }

      const result = await importRows(rows);
      if (result.status !== "success") {
        toast.error("Erro na importação", { description: result.message });
        return;
      }

      toast.success("Importação concluída", { description: result.message });
      setFile(null);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Erro na server action:", error);
      toast.error("Erro na importação", {
        description:
          error instanceof Error
            ? error.message
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
          <DialogDescription>{description}</DialogDescription>
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
                onClick={() => setFile(null)}
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

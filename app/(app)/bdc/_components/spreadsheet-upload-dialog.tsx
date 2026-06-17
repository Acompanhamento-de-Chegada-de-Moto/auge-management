"use client";

import { FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
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

const ACCEPTED_TYPES = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
  "text/csv": [".csv"],
};

export function SpreadsheetUploadDialog() {
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

    // try {
    //   const formData = new FormData();
    //   formData.append("file", file);

    //   let result;

    //   if (result.success) {
    //     toast.success("Importação concluída", {
    //       description: result.message,
    //     });
    //     setFile(null);
    //     setOpen(false);
    //     router.refresh();
    //   } else {
    //     toast.error("Erro na importação", {
    //       description: result.error,
    //     });
    //   }
    // } catch {
    //   toast.error("Erro na importação", {
    //     description: "Não foi possível processar o arquivo. Tente novamente.",
    //   });
    // } finally {
    //   setIsUploading(false);
    // }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 size-4" />
          Importar Planilha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Planilha</DialogTitle>
          <DialogDescription>
            Envie uma planilha com os dados dos clientes. Formatos aceitos:
            Excel, LibreOffice ou CSV.
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

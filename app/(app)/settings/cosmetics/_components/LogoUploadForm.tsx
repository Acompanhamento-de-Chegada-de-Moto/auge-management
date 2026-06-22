"use client";

import { CheckCircle2Icon, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  uploadLogoAction,
  removeLogoAction,
} from "@/app/(app)/settings/actions";

const DEFAULT_LOGO = "/logo-auge.png";

interface LogoUploadFormProps {
  currentLogoUrl: string | null;
}

export function LogoUploadForm({ currentLogoUrl }: LogoUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();

  const inputId = useId();

  const logoUrl = currentLogoUrl || DEFAULT_LOGO;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);

    if (selected) {
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("logo", file);

    startUploadTransition(async () => {
      const result = await uploadLogoAction(formData);

      if (result.status === "success") {
        setSuccess(true);
        setFile(null);
        setPreview(null);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.message);
      }
    });
  };

  const handleRemove = () => {
    setError(null);
    setSuccess(false);

    startUploadTransition(async () => {
      const result = await removeLogoAction();

      if (result.status === "success") {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ImageIcon className="size-4" />
        </div>
        <div>
          <CardTitle className="text-base">Logo do Sistema</CardTitle>
          <CardDescription>
            Altere a logo exibida na navbar e na página de acompanhamento
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300"
          >
            <CheckCircle2Icon className="size-4 shrink-0" />
            Logo salva com sucesso!
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-center">
          <div className="relative size-20 overflow-hidden rounded-lg border">
            <Image
              src={preview || logoUrl}
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={inputId}>Nova logo</Label>
          <input
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            className="flex w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
          />
        </div>

        <div className="flex gap-2">
          {currentLogoUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="mr-1 size-3 animate-spin" />
              ) : (
                <Trash2 className="mr-1 size-3" />
              )}
              Remover
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="ml-auto"
          >
            {isUploading ? (
              <Loader2 className="mr-1 size-3 animate-spin" />
            ) : (
              <Upload className="mr-1 size-3" />
            )}
            {isUploading ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

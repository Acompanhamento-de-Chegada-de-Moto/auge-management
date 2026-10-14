"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ApiResponse } from "@/lib/types";

interface ConfirmDeleteDialogProps {
  action: () => Promise<ApiResponse>;
  itemType: string;
  itemName: string;
  description: string;
  triggerLabel: string;
  trigger?: ReactNode;
  disabled?: boolean;
  onDeleted?: () => void;
}

export function ConfirmDeleteDialog({
  action,
  itemType,
  itemName,
  description,
  triggerLabel,
  trigger,
  disabled = false,
  onDeleted,
}: ConfirmDeleteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [missing, setMissing] = useState(false);

  async function handleDelete() {
    if (isDeleting || disabled) return;
    setIsDeleting(true);

    try {
      const result = await action();
      if (result.status === "error") {
        if (result.statusCode === 404) {
          setMissing(true);
          return;
        }
        toast.error(result.message);
        return;
      }

      toast.success(result.message || `${itemType} excluído com sucesso.`);
      onDeleted?.();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(
        `Não foi possível excluir ${itemType.toLowerCase()}. Tente novamente.`,
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting && !disabled) {
          setOpen(nextOpen);
          if (!nextOpen) setMissing(false);
        }
      }}
    >
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={triggerLabel}
            title={triggerLabel}
            disabled={isDeleting || disabled}
            className="min-h-10 min-w-10 text-error hover:bg-error/10"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent
        showCloseButton={!isDeleting}
        className="box-border w-full max-w-md min-w-0 overflow-x-hidden rounded-xl"
      >
        <AlertDialogHeader className="min-w-0">
          <AlertDialogMedia>
            <Trash2 className="size-5" aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {missing
              ? "Registro não encontrado"
              : `Excluir ${itemType.toLowerCase()}?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="min-w-0 whitespace-normal break-words">
            {missing
              ? "Este registro já foi excluído ou não está mais disponível. Atualize a lista para continuar."
              : description}
          </AlertDialogDescription>
          <p className="break-words rounded-lg border border-base-300/80 bg-base-200 px-3 py-2 font-medium text-base-content">
            {itemName}
          </p>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-5 sm:mt-6">
          {missing ? (
            <Button
              type="button"
              onClick={() => {
                setOpen(false);
                setMissing(false);
                router.refresh();
              }}
            >
              Atualizar lista
            </Button>
          ) : (
            <>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
              >
                {isDeleting ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="size-4" aria-hidden="true" />
                )}
                {isDeleting ? "Excluindo…" : "Excluir"}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

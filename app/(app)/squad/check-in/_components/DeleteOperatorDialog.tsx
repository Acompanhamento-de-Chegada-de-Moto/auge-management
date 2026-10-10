"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteOperatorAction } from "../_actions/operators";

export function DeleteOperatorDialog({
  operator,
  disabled,
  onDeleted,
}: {
  operator: { id: string; name: string };
  disabled: boolean;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  async function remove() {
    setDeleting(true);
    try {
      const result = await deleteOperatorAction(operator.id);
      if (result.status !== "success") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      onDeleted();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Não foi possível excluir o operador. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!deleting) setOpen(value);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="text-error hover:bg-error/10"
          aria-label={`Excluir operador ${operator.name}`}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir operador?</AlertDialogTitle>
          <AlertDialogDescription>
            O cadastro de <strong>{operator.name}</strong> será excluído e todas
            as sessões serão encerradas. Os recebimentos anteriores e o nome
            registrado no histórico serão preservados. Esta exclusão não pode
            ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            disabled={deleting}
            className="bg-error text-error-content hover:bg-error/90"
            onClick={() => void remove()}
          >
            {deleting ? "Excluindo…" : "Excluir operador"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

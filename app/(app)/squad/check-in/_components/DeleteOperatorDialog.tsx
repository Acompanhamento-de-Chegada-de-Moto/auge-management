"use client";
import { Trash2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
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
  return (
    <ConfirmDeleteDialog
      action={() => deleteOperatorAction(operator.id)}
      itemType="Operador"
      itemName={operator.name}
      triggerLabel={`Excluir operador ${operator.name}`}
      disabled={disabled}
      onDeleted={onDeleted}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="text-error hover:bg-error/10"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Excluir
        </Button>
      }
      description="As sessões serão encerradas. Os recebimentos anteriores e o nome registrado no histórico serão preservados. Esta exclusão não pode ser desfeita."
    />
  );
}

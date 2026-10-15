import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { deleteClientAction } from "@/app/(app)/bdc/_actions/clients";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { buttonVariants } from "@/components/ui/button";

interface BDCRowActionsProps {
  clientId: string;
  clientName: string;
  motorcycleId?: string;
}

export function BDCRowActions({
  clientId,
  clientName,
  motorcycleId,
}: BDCRowActionsProps) {
  const editHref = motorcycleId
    ? `/bdc/client/${clientId}/edit?motorcycleId=${motorcycleId}`
    : `/bdc/client/${clientId}/edit`;

  return (
    <div className="flex shrink-0 items-center justify-end gap-1">
      <Link
        href={editHref}
        aria-label={`Editar cliente ${clientName}`}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "min-h-10",
        })}
      >
        <PencilIcon className="mr-2 size-4" /> Editar
      </Link>
      <ConfirmDeleteDialog
        action={() => deleteClientAction(clientId)}
        itemType="Cliente"
        itemName={clientName}
        description="A exclusão remove o cadastro e desfaz o vínculo com as motocicletas associadas. Essa ação não pode ser desfeita."
        triggerLabel={`Excluir cliente ${clientName}`}
      />
    </div>
  );
}

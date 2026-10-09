import { PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
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
      <Link
        href={`/bdc/client/${clientId}/delete`}
        aria-label={`Excluir cliente ${clientName}`}
        className={buttonVariants({
          variant: "ghost",
          size: "icon",
          className: "min-h-10 min-w-10 text-destructive",
        })}
      >
        <Trash2Icon className="size-4" />
      </Link>
    </div>
  );
}

import { PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

import type { ClientRow } from "@/app/(app)/bdc/actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getArrivalStatus,
  getStatusColor,
  mapRegistrationStatusLabel,
} from "@/lib/bdc-data";
import { formatCPF } from "@/lib/cpf";
import { formatDateBR } from "@/lib/utils";

interface BDCMobileCardProps {
  row: ClientRow;
}

export function BDCMobileCard({ row }: BDCMobileCardProps) {
  const motorcycle = row.motorcycle;

  const arrivalStatus = getArrivalStatus(
    motorcycle?.forecastArrival ?? null,
    motorcycle?.forecastArrivalStatus,
  );

  const registrationStatus = motorcycle?.registrationStatus
    ? mapRegistrationStatusLabel(motorcycle.registrationStatus)
    : null;

  const editHref = motorcycle
    ? `/bdc/client/${row.id}/edit?motorcycleId=${motorcycle.id}`
    : `/bdc/client/${row.id}/edit`;

  return (
    <article className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{formatCPF(row.cpf)}</p>
        </div>

        <div className="flex shrink-0 gap-1">
          <Link
            href={editHref}
            aria-label={`Editar cliente ${row.name}`}
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "min-h-[44px] min-w-[44px] rounded-full",
            })}
          >
            <PencilIcon className="size-4" />
          </Link>

          <Link
            href={`/bdc/client/${row.id}/delete`}
            aria-label={`Excluir cliente ${row.name}`}
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "min-h-[44px] min-w-[44px] rounded-full",
            })}
          >
            <Trash2Icon className="size-4 text-red-500" />
          </Link>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="min-w-0">
          <dt className="text-muted-foreground">Vendedor</dt>
          <dd className="break-words">{row.sellersName || "—"}</dd>
        </div>

        <div className="min-w-0">
          <dt className="text-muted-foreground">Modelo</dt>
          <dd className="break-words">{motorcycle?.model ?? "—"}</dd>
        </div>

        <div className="min-w-0">
          <dt className="text-muted-foreground">Cidade</dt>
          <dd className="break-words">{row.city || "—"}</dd>
        </div>

        <div className="min-w-0">
          <dt className="text-muted-foreground">Previsão</dt>
          <dd className="mt-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`px-3 py-1 ${arrivalStatus.color}`}>
                  {arrivalStatus.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {formatDateBR(motorcycle?.forecastArrival) ?? "Sem previsão"}
              </TooltipContent>
            </Tooltip>
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <div className="min-w-0 text-xs text-muted-foreground">
          <span>Chassi: </span>
          <span className="break-all">{motorcycle?.chassi ?? "—"}</span>
        </div>

        {registrationStatus ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className={`shrink-0 px-3 py-1 ${getStatusColor(registrationStatus)}`}
              >
                {registrationStatus}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {formatDateBR(motorcycle?.registrationDate) ??
                "Sem data de emplacamento"}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
    </article>
  );
}

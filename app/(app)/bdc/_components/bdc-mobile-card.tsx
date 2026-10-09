import { Badge } from "@/components/ui/badge";
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
import type { ClientRow } from "../_lib/types";
import { BDCRowActions } from "./bdc-row-actions";

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

  return (
    <article className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{formatCPF(row.cpf)}</p>
        </div>

        <BDCRowActions
          clientId={row.id}
          clientName={row.name}
          motorcycleId={motorcycle?.id}
        />
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

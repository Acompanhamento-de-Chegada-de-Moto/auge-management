import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface BDCDesktopTableProps {
  rows: ClientRow[];
}

export function BDCDesktopTable({ rows }: BDCDesktopTableProps) {
  return (
    <div className="hidden min-w-0 w-full overflow-hidden rounded-md border md:block">
      <Table className="w-full table-fixed text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%] whitespace-normal px-2">
              Cliente
            </TableHead>

            <TableHead className="hidden w-[12%] whitespace-normal px-2 xl:table-cell">
              CPF
            </TableHead>

            <TableHead className="hidden w-[12%] whitespace-normal px-2 xl:table-cell">
              Vendedor
            </TableHead>

            <TableHead className="hidden w-[12%] whitespace-normal px-2 2xl:table-cell">
              Cidade
            </TableHead>

            <TableHead className="w-[14%] whitespace-normal px-2">
              Modelo
            </TableHead>

            <TableHead className="w-[14%] whitespace-normal px-2">
              Chassi
            </TableHead>

            <TableHead className="hidden w-[12%] whitespace-normal px-2 2xl:table-cell">
              Faturamento
            </TableHead>

            <TableHead className="w-[14%] whitespace-normal px-2">
              Previsão
            </TableHead>

            <TableHead className="w-[12%] whitespace-normal px-2">
              Situação
            </TableHead>

            <TableHead className="w-[140px] whitespace-normal px-2">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row, index) => {
            const motorcycle = row.motorcycle;

            const arrivalStatus = getArrivalStatus(
              motorcycle?.forecastArrival ?? null,
              motorcycle?.forecastArrivalStatus,
            );

            const registrationStatus = motorcycle?.registrationStatus
              ? mapRegistrationStatusLabel(motorcycle.registrationStatus)
              : null;

            return (
              <TableRow
                key={row.rowKey}
                className={index % 2 === 0 ? undefined : "bg-muted/20"}
              >
                <TableCell className="min-w-0 whitespace-normal break-words px-2">
                  {row.name}
                </TableCell>

                <TableCell className="hidden whitespace-normal px-2 xl:table-cell">
                  <span title={row.cpf}>{formatCPF(row.cpf)}</span>
                </TableCell>

                <TableCell className="hidden whitespace-normal break-words px-2 xl:table-cell">
                  {row.sellersName || "—"}
                </TableCell>

                <TableCell className="hidden whitespace-normal break-words px-2 2xl:table-cell">
                  {row.city || "—"}
                </TableCell>

                <TableCell className="min-w-0 whitespace-normal break-words px-2">
                  {motorcycle?.model ?? "—"}
                </TableCell>

                <TableCell className="min-w-0 whitespace-normal break-all px-2">
                  {motorcycle?.chassi ?? "—"}
                </TableCell>

                <TableCell className="hidden whitespace-normal px-2 2xl:table-cell">
                  {formatDateBR(row.billingDate) ?? "—"}
                </TableCell>

                <TableCell className="min-w-0 whitespace-normal px-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className={`whitespace-nowrap px-2 py-1 text-[11px] ${arrivalStatus.color}`}
                      >
                        {arrivalStatus.label}
                      </Badge>
                    </TooltipTrigger>

                    <TooltipContent>
                      {formatDateBR(motorcycle?.forecastArrival) ??
                        "Sem previsão"}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell className="min-w-0 whitespace-normal px-2">
                  {registrationStatus ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={`whitespace-nowrap px-2 py-1 text-[11px] ${getStatusColor(registrationStatus)}`}
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
                    "—"
                  )}
                </TableCell>

                <TableCell className="px-2">
                  <BDCRowActions
                    clientId={row.id}
                    clientName={row.name}
                    motorcycleId={motorcycle?.id}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

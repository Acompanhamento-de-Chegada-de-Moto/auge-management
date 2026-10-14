import Link from "next/link";
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
  getArrivalStatus,
  getStatusColor,
  mapRegistrationStatusLabel,
} from "@/lib/bdc-data";
import { formatCPF } from "@/lib/cpf";
import { formatDateBR } from "@/lib/utils";
import type { ClientRow } from "../_lib/types";
import { BDCRowActions } from "./bdc-row-actions";
import { CopyValueButton } from "./CopyValueButton";

export function BDCDesktopTable({ rows }: { rows: ClientRow[] }) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table className="min-w-[1000px] text-[13px]">
        <caption className="sr-only">
          Clientes com motocicletas, responsáveis, previsão de chegada e
          emplacamento.
        </caption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[24%]">Cliente</TableHead>
            <TableHead className="w-[18%]">Responsável / cidade</TableHead>
            <TableHead className="w-[23%]">Motocicleta</TableHead>
            <TableHead>Chegada</TableHead>
            <TableHead>Emplacamento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const motorcycle = row.motorcycle;
            const arrival = getArrivalStatus(
              motorcycle?.forecastArrival ?? null,
              motorcycle?.forecastArrivalStatus,
            );
            const registration = motorcycle?.registrationStatus
              ? mapRegistrationStatusLabel(motorcycle.registrationStatus)
              : null;
            const editHref = `/bdc/client/${row.id}/edit${motorcycle ? `?motorcycleId=${motorcycle.id}` : ""}`;
            return (
              <TableRow key={row.rowKey}>
                <TableCell className="max-w-72 whitespace-normal">
                  <Link
                    href={editHref}
                    className="font-medium leading-5 hover:text-primary hover:underline"
                  >
                    {row.name}
                  </Link>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    <CopyValueButton value={formatCPF(row.cpf)} label="CPF" />
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Faturamento: {formatDateBR(row.billingDate) ?? "Sem data"}
                  </p>
                </TableCell>
                <TableCell className="max-w-52 whitespace-normal">
                  <p className="leading-5">
                    {row.sellersName || "Sem vendedor"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.city || "Sem cidade"}
                  </p>
                </TableCell>
                <TableCell className="max-w-64 whitespace-normal">
                  <p className="font-medium leading-5">
                    {motorcycle?.model ?? "Sem motocicleta"}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                    {motorcycle?.chassi ? (
                      <CopyValueButton
                        value={motorcycle.chassi}
                        label="Chassi"
                      />
                    ) : (
                      "—"
                    )}
                  </p>
                </TableCell>
                <TableCell>
                  {motorcycle ? (
                    <>
                      <Badge
                        className={`px-2 py-0.5 text-[11px] ${arrival.color}`}
                      >
                        {arrival.label}
                      </Badge>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {formatDateBR(motorcycle.forecastArrival) ??
                          "Sem previsão"}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {registration ? (
                    <>
                      <Badge
                        className={`px-2 py-0.5 text-[11px] ${getStatusColor(registration)}`}
                      >
                        {registration}
                      </Badge>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {formatDateBR(motorcycle?.registrationDate) ??
                          "Sem data"}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
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

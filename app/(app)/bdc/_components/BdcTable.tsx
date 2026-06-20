"use client";

import { format } from "date-fns";
import { PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import type { UserGetClientsType } from "@/app/data/user/user-get-clients";
import { CopyText } from "@/components/general/CopyText";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getArrivalStatus,
  getStatusColor,
  mapRegistrationStatusLabel,
} from "@/lib/bdc-data";
import { formatCPF } from "@/lib/cpf";

interface IBDCTableProps {
  data: UserGetClientsType[];
  filters: {
    sellerName: string;
    city: string;
    model: string;
  };
}

export function BDCTable({ data, filters }: IBDCTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const sellers = useMemo(
    () => [...new Set(data.map((item) => item.sellersName).filter(Boolean))],
    [data],
  );

  const cities = useMemo(
    () => [...new Set(data.map((item) => item.city).filter(Boolean))],
    [data],
  );

  const models = useMemo(
    () => [
      ...new Set(
        data.flatMap((item) =>
          item.motorcycles
            .map((motorcycle) => motorcycle.model)
            .filter(Boolean),
        ),
      ),
    ],
    [data],
  );

  const updateFilter = (
    key: "sellerName" | "city" | "model",
    value: string,
  ) => {
    const params = new URLSearchParams(searchParams);

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  return (
    <TooltipProvider>
      <div className="md:hidden space-y-3">
        {data.map((item) => {
          const motorcycle = item.motorcycles[0];
          return (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCPF(item.cpf)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Link
                    href={`/bdc/client/${item.id}/edit`}
                    aria-label={`Editar cliente ${item.name}`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon",
                      className: "rounded-full min-h-[44px] min-w-[44px]",
                    })}
                  >
                    <PencilIcon className="size-4" />
                  </Link>
                  <Link
                    href={`/bdc/client/${item.id}/delete`}
                    aria-label={`Excluir cliente ${item.name}`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon",
                      className: "rounded-full min-h-[44px] min-w-[44px]",
                    })}
                  >
                    <Trash2Icon className="size-4 text-red-500" />
                  </Link>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Vendedor</dt>
                  <dd>{item.sellersName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Modelo</dt>
                  <dd>{motorcycle?.model ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Cidade</dt>
                  <dd>{item.city}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Previsão</dt>
                  <dd>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={
                            getArrivalStatus(
                              motorcycle?.forecastArrival ?? null,
                            ).color
                          }
                        >
                          {
                            getArrivalStatus(
                              motorcycle?.forecastArrival ?? null,
                            ).label
                          }
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {motorcycle?.forecastArrival
                          ? format(motorcycle.forecastArrival, "dd/MM/yyyy")
                          : "Sem previsão"}
                      </TooltipContent>
                    </Tooltip>
                  </dd>
                </div>
              </dl>

              <div className="mt-3 flex items-center justify-between border-t pt-2">
                <span className="text-xs text-muted-foreground">
                  Chassi: {motorcycle?.chassi ?? "—"}
                </span>
                {motorcycle?.registrationStatus ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className={getStatusColor(
                          mapRegistrationStatusLabel(
                            motorcycle.registrationStatus,
                          ),
                        )}
                      >
                        {mapRegistrationStatusLabel(
                          motorcycle.registrationStatus,
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {motorcycle.registrationDate
                        ? format(motorcycle.registrationDate, "dd/MM/yyyy")
                        : "Sem data de emplacamento"}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full hidden md:block rounded-sm">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Select
            value={filters.sellerName || "all"}
            onValueChange={(value) => updateFilter("sellerName", value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Vendedor" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todos os vendedores</SelectItem>

              {sellers.map((seller) => (
                <SelectItem key={seller} value={seller}>
                  {seller}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.city || "all"}
            onValueChange={(value) => updateFilter("city", value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>

              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.model || "all"}
            onValueChange={(value) => updateFilter("model", value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Modelo" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todos os modelos</SelectItem>

              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={clearFilters} disabled={isPending}>
            Limpar filtros
          </Button>
        </div>

        <div
          className={
            isPending ? "pointer-events-none opacity-60 transition-opacity" : ""
          }
        >
          <div className="rounded-sm border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="hidden md:table-cell">Cidade</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Chassi</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Data Faturamento
                  </TableHead>
                  <TableHead>Previsão Chegada</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10} // Ajustado colSpan para bater com o número correto de colunas
                      className="py-8 text-center text-muted-foreground"
                    >
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => {
                    const motorcycle = item.motorcycles[0];

                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>

                        <TableCell>
                          <CopyText text={item.cpf}>
                            <span>{formatCPF(item.cpf)}</span>
                          </CopyText>
                        </TableCell>

                        <TableCell>{item.sellersName}</TableCell>

                        <TableCell className="hidden md:table-cell">
                          {item.city}
                        </TableCell>

                        <TableCell>{motorcycle?.model ?? "—"}</TableCell>

                        <TableCell>
                          {motorcycle?.chassi ? (
                            <CopyText text={motorcycle.chassi}>
                              <span>{motorcycle.chassi}</span>
                            </CopyText>
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        <TableCell className="hidden md:table-cell">
                          {item.billingDate
                            ? format(item.billingDate, "dd/MM/yyyy")
                            : "—"}
                        </TableCell>

                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                className={
                                  getArrivalStatus(
                                    motorcycle?.forecastArrival ?? null,
                                  ).color
                                }
                              >
                                {
                                  getArrivalStatus(
                                    motorcycle?.forecastArrival ?? null,
                                  ).label
                                }
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {motorcycle?.forecastArrival
                                ? format(
                                    motorcycle.forecastArrival,
                                    "dd/MM/yyyy",
                                  )
                                : "Sem previsão"}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>

                        <TableCell>
                          {motorcycle?.registrationStatus ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  className={getStatusColor(
                                    mapRegistrationStatusLabel(
                                      motorcycle.registrationStatus,
                                    ),
                                  )}
                                >
                                  {mapRegistrationStatusLabel(
                                    motorcycle.registrationStatus,
                                  )}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {motorcycle.registrationDate
                                  ? format(
                                      motorcycle.registrationDate,
                                      "dd/MM/yyyy",
                                    )
                                  : "Sem data de emplacamento"}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex h-full items-center gap-1">
                            <Link
                              href={`/bdc/client/${item.id}/edit`}
                              aria-label={`editar-${item.id}`}
                              className={buttonVariants({
                                variant: "ghost",
                                size: "icon",
                                className:
                                  "rounded-full min-h-[44px] min-w-[44px]",
                              })}
                            >
                              <PencilIcon className="size-4" />
                            </Link>
                            <Link
                              href={`/bdc/client/${item.id}/delete`}
                              aria-label={`deletar-${item.id}`}
                              className={buttonVariants({
                                variant: "ghost",
                                size: "icon",
                                className:
                                  "rounded-full min-h-[44px] min-w-[44px]",
                              })}
                            >
                              <Trash2Icon className="size-4 text-red-500" />
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

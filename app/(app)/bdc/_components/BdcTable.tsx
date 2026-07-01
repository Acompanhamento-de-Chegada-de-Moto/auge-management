"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight, PencilIcon, SearchIcon, Trash2Icon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { ClientRow } from "@/app/(app)/bdc/actions";
import { CopyText } from "@/components/general/CopyText";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  rows: ClientRow[];
  totalPages: number;
  page: number;
  filterOptions: {
    sellers: string[];
    cities: string[];
    models: string[];
  };
  activeFilters: {
    sellerName: string;
    city: string;
    model: string;
    search: string;
  };
}

export function BDCTable({
  rows,
  totalPages,
  page,
  filterOptions,
  activeFilters,
}: IBDCTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(activeFilters.search);

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
    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (!value) {
      params.delete("search");
    } else {
      params.set("search", value);
    }
    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.replace(pathname);
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <TooltipProvider>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={activeFilters.sellerName || "all"}
          onValueChange={(value) => updateFilter("sellerName", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os vendedores</SelectItem>
            {filterOptions.sellers.map((seller) => (
              <SelectItem key={seller} value={seller}>
                {seller}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={activeFilters.city || "all"}
          onValueChange={(value) => updateFilter("city", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {filterOptions.cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={activeFilters.model || "all"}
          onValueChange={(value) => updateFilter("model", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os modelos</SelectItem>
            {filterOptions.models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative w-full sm:w-[220px]">
          <button
            type="button"
            onClick={() => updateSearch(searchInput)}
            className="absolute left-2 top-1/2 -translate-y-1/2"
          >
            <SearchIcon className="size-4 text-muted-foreground hover:text-foreground" />
          </button>
          <Input
            placeholder="Buscar nome, CPF ou chassi"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateSearch(searchInput);
              }
            }}
            className="pl-8 pr-8"
            disabled={isPending}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateSearch("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={handleClearFilters}
          disabled={isPending}
        >
          Limpar filtros
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-sm border py-8 text-center text-muted-foreground">
          Nenhum registro encontrado.
        </div>
      ) : (
        <div
          className={isPending ? "pointer-events-none opacity-60 transition-opacity" : ""}
        >
          <div className="md:hidden space-y-3">
            {rows.map((row) => {
              const motorcycle = row.motorcycle;
              return (
                <div key={row.rowKey} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCPF(row.cpf)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        href={`/bdc/client/${row.id}/edit`}
                        aria-label={`Editar cliente ${row.name}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon",
                          className: "rounded-full min-h-[44px] min-w-[44px]",
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
                      <dd>{row.sellersName}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Modelo</dt>
                      <dd>{motorcycle?.model ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Cidade</dt>
                      <dd>{row.city}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Previsão</dt>
                      <dd>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              className={`px-3 py-1 ${
                                getArrivalStatus(
                                  motorcycle?.forecastArrival ?? null,
                                  motorcycle?.forecastArrivalStatus,
                                ).color
                              }`}
                            >
                              {
                                getArrivalStatus(
                                  motorcycle?.forecastArrival ?? null,
                                  motorcycle?.forecastArrivalStatus,
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
                            className={`px-3 py-1 ${getStatusColor(
                              mapRegistrationStatusLabel(
                                motorcycle.registrationStatus,
                              ),
                            )}`}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isPending}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isPending}
                  onClick={() => handlePageChange(page + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <div className="rounded-sm border shadow-sm">
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
                  {rows.map((row, index) => {
                    const motorcycle = row.motorcycle;

                    return (
                      <TableRow
                        key={row.rowKey}
                        className={index % 2 === 0 ? undefined : "bg-muted/20"}
                      >
                        <TableCell>{row.name}</TableCell>
                        <TableCell>
                          <CopyText text={row.cpf}>
                            <span>{formatCPF(row.cpf)}</span>
                          </CopyText>
                        </TableCell>
                        <TableCell>{row.sellersName}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {row.city}
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
                          {row.billingDate
                            ? format(row.billingDate, "dd/MM/yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                className={`px-3 py-1 ${
                                  getArrivalStatus(
                                    motorcycle?.forecastArrival ?? null,
                                    motorcycle?.forecastArrivalStatus,
                                  ).color
                                }`}
                              >
                                {
                                  getArrivalStatus(
                                    motorcycle?.forecastArrival ?? null,
                                    motorcycle?.forecastArrivalStatus,
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
                                  className={`px-3 py-1 ${getStatusColor(
                                    mapRegistrationStatusLabel(
                                      motorcycle.registrationStatus,
                                    ),
                                  )}`}
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
                              href={`/bdc/client/${row.id}/edit`}
                              aria-label={`editar-${row.id}`}
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
                              href={`/bdc/client/${row.id}/delete`}
                              aria-label={`deletar-${row.id}`}
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
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isPending}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ChevronLeft className="mr-1 size-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isPending}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Próximo
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}

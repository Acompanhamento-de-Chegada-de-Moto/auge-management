"use client";

import {
  CheckIcon,
  CopyIcon,
  PencilIcon,
  Search,
  Trash2Icon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteClientAction } from "@/app/(app)/bdc/actions";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { getStatusColor } from "@/lib/bdc-data";

interface FlatRow {
  id: string;
  clientId: string;
  customerName: string;
  cpf: string;
  sellerName: string;
  city: string;
  model: string;
  chassis: string;
  billingDate: string;
  forecastDate: Date | null;
  registrationStatus: "Sem Emplacamento" | "Emplacando" | "Emplacado";
}

interface FilterOptions {
  sellers: string[];
  cities: string[];
  models: string[];
}

interface BDCTableProps {
  rows: FlatRow[];
  totalRows: number;
  page: number;
  totalPages: number;
  filterOptions: FilterOptions;
  filters: { sellerName: string; city: string; model: string };
  query: string;
  onFilterChange: (key: string, value: string) => void;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
}

const BDCTable = ({
  rows,
  totalRows,
  page,
  totalPages,
  filterOptions,
  filters,
  query,
  onFilterChange,
  onPageChange,
  onSearch,
  onClearSearch,
}: BDCTableProps) => {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function formatCPF(cpf: string): string {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleEdit = (id: string) => {
    router.push(`/bdc/cliente/editar?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteClientAction(id);
    router.refresh();
  };

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (filters.sellerName) params.set("sellerName", filters.sellerName);
    if (filters.city) params.set("city", filters.city);
    if (filters.model) params.set("model", filters.model);
    if (query) params.set("q", query);
    return `/bdc?${params.toString()}`;
  };

  const perPage = 20;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalRows);

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground mr-1">
          Filtros:
        </span>

        <Select
          value={filters.sellerName}
          onValueChange={(v) =>
            onFilterChange("sellerName", v === " " ? "" : v)
          }
        >
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {filterOptions.sellers.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.city}
          onValueChange={(v) => onFilterChange("city", v === " " ? "" : v)}
        >
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {filterOptions.cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.model}
          onValueChange={(v) => onFilterChange("model", v === " " ? "" : v)}
        >
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {filterOptions.models.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <form
          key={query ?? ""}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const value = (formData.get("search") as string).trim();
            onSearch(value);
          }}
          className="flex items-center gap-1 ml-auto"
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              name="search"
              type="text"
              placeholder="Buscar por CPF ou nome..."
              defaultValue={query}
              className="h-8 w-40 sm:w-56 pl-8 pr-8 text-sm rounded-lg border border-border/60 bg-muted/40 focus-visible:bg-background"
            />
            {query && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Limpar busca"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="icon"
            className="size-8 rounded-lg shrink-0"
          >
            <Search className="size-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Cliente</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Data Faturamento</TableHead>
              <TableHead>Previsão Chegada</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center text-muted-foreground py-8"
                >
                  {query || filters.sellerName || filters.city || filters.model
                    ? "Nenhum resultado encontrado para os filtros aplicados."
                    : "Nenhum cliente cadastrado."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => {
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.customerName}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.cpf ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(formatCPF(item.cpf), `${item.id}-cpf`)
                          }
                          className="group inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs transition-colors"
                          title="Clique para copiar o CPF"
                        >
                          {copiedId === `${item.id}-cpf` ? (
                            <>
                              <CheckIcon className="size-3.5 text-green-600 dark:text-green-400" />
                              <span className="text-green-600 dark:text-green-400">
                                Copiado!
                              </span>
                            </>
                          ) : (
                            <>
                              <CopyIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                              <span className="hover:underline">
                                {formatCPF(item.cpf)}
                              </span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{item.sellerName}</TableCell>
                    <TableCell>{item.city}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell>
                      {item.chassis !== "—" ? (
                        <button
                          type="button"
                          onClick={() => handleCopy(item.chassis, item.id)}
                          className="group inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs transition-colors"
                          title="Clique para copiar o chassi"
                        >
                          {copiedId === item.id ? (
                            <>
                              <CheckIcon className="size-3.5 text-green-600 dark:text-green-400" />
                              <span className="text-green-600 dark:text-green-400">
                                Copiado!
                              </span>
                            </>
                          ) : (
                            <>
                              <CopyIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                              <span className="hover:underline">
                                {item.chassis}
                              </span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{item.billingDate}</TableCell>
                    <TableCell>
                      {item.forecastDate
                        ? new Date(item.forecastDate).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(item.registrationStatus)}`}
                      >
                        {item.registrationStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex h-full items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          aria-label={`editar-${item.clientId}`}
                          onClick={() => handleEdit(item.clientId)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          aria-label={`deletar-${item.clientId}`}
                          onClick={() => handleDelete(item.clientId)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Mostrando {totalRows > 0 ? `${start}-${end}` : "0"} de {totalRows}{" "}
            registro{totalRows !== 1 ? "s" : ""}
          </span>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  onClick={() => onPageChange(1)}
                  className={
                    page > 1
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                  aria-label="Primeira página"
                >
                  Primeiro
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(page - 1)}
                  className={
                    page > 1
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                />
              </PaginationItem>

              {totalPages <= 7 ? (
                Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => onPageChange(p)}
                        isActive={page === p}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )
              ) : (
                <>
                  {page > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => {
                      let p: number;
                      if (page <= 3) {
                        p = i + 1;
                      } else if (page >= totalPages - 2) {
                        p = totalPages - 4 + i;
                      } else {
                        p = page - 2 + i;
                      }
                      return p;
                    },
                  )
                    .filter((p) => p >= 1 && p <= totalPages)
                    .map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={() => onPageChange(p)}
                          isActive={page === p}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  {page < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(page + 1)}
                  className={
                    page < totalPages
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  onClick={() => onPageChange(totalPages)}
                  className={
                    page < totalPages
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                  aria-label="Última página"
                >
                  Último
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <p className="text-muted-foreground mt-4 text-center text-sm">
        Tabela BDC - Controle de Veículos
      </p>
    </div>
  );
};

export default BDCTable;

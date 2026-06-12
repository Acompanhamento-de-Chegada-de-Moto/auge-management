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
import { useMemo, useState } from "react";
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
import { usePagination } from "@/hooks/use-pagination";
import {
  getStatusColor,
  mapRegistrationStatusLabel,
} from "@/lib/bdc-data";

interface MotorcycleRow {
  id: string;
  model: string;
  chassis: string;
  forecastDate: Date | null;
  registrationStatus: "NO_PLATE" | "PLATING" | "PLATED";
}

interface ClientRow {
  id: string;
  cpf: string;
  name: string;
  sellerName: string;
  city: string;
  billingDate: Date | null;
  motorcycles: MotorcycleRow[];
}

interface Filters {
  sellerName: string;
  city: string;
  model: string;
}

interface BDCTableProps {
  clients: ClientRow[];
  query?: string;
}

const BDCTable = ({ clients, query }: BDCTableProps) => {
  const router = useRouter();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    sellerName: "",
    city: "",
    model: "",
  });

  function formatCPF(cpf: string): string {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  const rows: Array<{
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
  }> = (clients ?? []).flatMap((client: ClientRow) =>
    client.motorcycles.length > 0
      ? client.motorcycles.map((motorcycle) => ({
          id: `${client.id}-${motorcycle.id}`,
          clientId: client.id,
          customerName: client.name,
          cpf: client.cpf,
          sellerName: client.sellerName,
          city: client.city,
          model: motorcycle.model,
          chassis: motorcycle.chassis,
          billingDate: client.billingDate
            ? new Date(client.billingDate).toLocaleDateString("pt-BR")
            : "—",
          forecastDate: motorcycle.forecastDate,
          registrationStatus: mapRegistrationStatusLabel(
            motorcycle.registrationStatus,
          ) as "Sem Emplacamento" | "Emplacando" | "Emplacado",
        }))
      : [
          {
            id: client.id,
            clientId: client.id,
            customerName: client.name,
            cpf: client.cpf,
            sellerName: client.sellerName,
            city: client.city,
            model: "—",
            chassis: "—",
            billingDate: client.billingDate
              ? new Date(client.billingDate).toLocaleDateString("pt-BR")
              : "—",
            forecastDate: null,
            registrationStatus: "Sem Emplacamento" as const,
          },
        ],
  );

  const uniqueSellers = useMemo(
    () => [...new Set(rows.map((r) => r.sellerName).filter(Boolean))].sort(),
    [rows],
  );
  const uniqueCities = useMemo(
    () => [...new Set(rows.map((r) => r.city).filter(Boolean))].sort(),
    [rows],
  );
  const uniqueModels = useMemo(
    () =>
      [...new Set(rows.map((r) => r.model).filter((m) => m !== "—"))].sort(),
    [rows],
  );

  const activeFilter = (v: string) => v && v !== " ";

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (
          activeFilter(filters.sellerName) &&
          row.sellerName !== filters.sellerName
        )
          return false;
        if (activeFilter(filters.city) && row.city !== filters.city)
          return false;
        if (activeFilter(filters.model) && row.model !== filters.model)
          return false;
        return true;
      }),
    [rows, filters],
  );

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    gotoPage(1);
  };

  const {
    currentPage,
    totalPages,
    canPreviousPage,
    canNextPage,
    gotoPage,
    previousPage,
    nextPage,
    itemsPerPage,
    setItemsPerPage,
    itemsPerPageOptions,
    paginatedRange,
  } = usePagination({
    totalItems: filteredRows.length,
    initialPage: 1,
    itemsPerPage: 10,
  });

  const paginatedRows = useMemo(
    () => filteredRows.slice(paginatedRange.start, paginatedRange.end),
    [filteredRows, paginatedRange.start, paginatedRange.end],
  );

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

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground mr-1">
          Filtros:
        </span>

        <Select
          value={filters.sellerName}
          onValueChange={(v) => handleFilterChange("sellerName", v)}
        >
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {uniqueSellers.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.city}
          onValueChange={(v) => handleFilterChange("city", v)}
        >
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {uniqueCities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.model}
          onValueChange={(v) => handleFilterChange("model", v)}
        >
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {uniqueModels.map((m) => (
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
            if (value) {
              router.push(`/bdc?q=${encodeURIComponent(value)}`);
            }
          }}
          className="flex items-center gap-1 ml-auto"
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              name="search"
              type="text"
              placeholder="Buscar por CPF..."
              defaultValue={query}
              className="h-8 w-40 sm:w-56 pl-8 pr-8 text-sm rounded-lg border border-border/60 bg-muted/40 focus-visible:bg-background"
            />
            {query && (
              <button
                type="button"
                onClick={() => router.push("/bdc")}
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
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center text-muted-foreground py-8"
                >
                  {rows.length === 0
                    ? "Nenhum cliente cadastrado."
                    : "Nenhum resultado encontrado para os filtros aplicados."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((item) => {
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
            Mostrando {paginatedRange.start + 1}-{paginatedRange.end} de{" "}
            {filteredRows.length} registro{filteredRows.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Itens por página:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  onClick={() => gotoPage(1)}
                  className={
                    canPreviousPage
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                >
                  Primeiro
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  onClick={previousPage}
                  className={
                    canPreviousPage
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                />
              </PaginationItem>

              {totalPages <= 10 ? (
                Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => gotoPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )
              ) : (
                <>
                  {[1, 2, 3].map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => gotoPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  {[totalPages - 2, totalPages - 1, totalPages].map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => gotoPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={nextPage}
                  className={
                    canNextPage
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  onClick={() => gotoPage(totalPages)}
                  className={
                    canNextPage
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                >
                  Último
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <p className="text-muted-foreground mt-4 text-center text-sm">
        Tabela BDC - Controle de Veículos
      </p>
    </div>
  );
};

export default BDCTable;
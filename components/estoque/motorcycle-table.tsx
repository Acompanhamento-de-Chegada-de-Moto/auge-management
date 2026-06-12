"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckIcon, CopyIcon, PencilIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { deleteMotorcycleAction } from "@/app/(app)/estoque/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMotorcycles } from "@/hooks/use-motorcycles";
import dayjs from "dayjs";
import { usePagination } from "@/hooks/use-pagination";

function getArrivalStatus(forecastDate: Date | null) {
  if (!forecastDate) {
    return {
      label: "Em Trânsito",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  const hoje = dayjs().startOf("day");
  const arrival = dayjs(forecastDate).startOf("day");

  if (arrival.isAfter(hoje)) {
    return {
      label: "Em Trânsito",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  if (arrival.isSame(hoje, "day")) {
    return {
      label: "Chegou",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  return {
    label: "Atrasada",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
}

function MotorcycleTableSkeleton() {
  return (
    <div className="w-full">
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Previsão de Chegada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
              <TableRow key={`skeleton-${i}`}>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface Filters {
  model: string;
  status: string;
}

export default function MotorcycleTable() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: motorcycles, isLoading, error } = useMotorcycles();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ model: "", status: "" });
  const [chassisSearch, setChassisSearch] = useState("");

  const activeFilter = (v: string) => v && v !== " ";

  const uniqueModels = useMemo(
    () =>
      [...new Set((motorcycles ?? []).map((m) => m.model).filter(Boolean))].sort(),
    [motorcycles],
  );

  const filteredMotorcycles = useMemo(
    () =>
      (motorcycles ?? []).filter((moto) => {
        if (activeFilter(filters.model) && moto.model !== filters.model)
          return false;
        if (activeFilter(filters.status)) {
          const status = getArrivalStatus(moto.forecastDate);
          if (status.label !== filters.status) return false;
        }
        if (chassisSearch) {
          const q = chassisSearch.toLowerCase();
          if (!moto.chassis.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [motorcycles, filters, chassisSearch],
  );

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
    totalItems: filteredMotorcycles.length,
    initialPage: 1,
    itemsPerPage: 10,
  });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    gotoPage(1);
  };

  const paginatedMotorcycles = useMemo(
    () => filteredMotorcycles.slice(paginatedRange.start, paginatedRange.end),
    [filteredMotorcycles, paginatedRange.start, paginatedRange.end],
  );

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await deleteMotorcycleAction(id);
    queryClient.invalidateQueries({ queryKey: ["motorcycles"] });
  };

  if (isLoading) {
    return <MotorcycleTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Erro ao carregar dados. Tente novamente.
      </div>
    );
  }

  const statusOptions = ["Em Trânsito", "Chegou", "Atrasada"];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground mr-1">
          Filtros:
        </span>

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
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => handleFilterChange("status", v)}
        >
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative ml-auto">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar chassi..."
            value={chassisSearch}
            onChange={(e) => { setChassisSearch(e.target.value); gotoPage(1); }}
            className="pl-8 h-8 w-[200px] text-sm"
          />
        </div>
      </div>

      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Previsão de Chegada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMotorcycles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  {filteredMotorcycles.length === 0 && (motorcycles?.length ?? 0) > 0
                    ? "Nenhum resultado para os filtros atuais."
                    : "Nenhuma motocicleta cadastrada."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedMotorcycles.map((motorcycle) => {
                const status = getArrivalStatus(motorcycle.forecastDate);
                return (
                  <TableRow key={motorcycle.id}>
                    <TableCell className="font-medium">
                      {motorcycle.model}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(motorcycle.chassis, motorcycle.id)
                        }
                        className="group inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs transition-colors"
                        title="Clique para copiar o chassi"
                      >
                        {copiedId === motorcycle.id ? (
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
                              {motorcycle.chassis}
                            </span>
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      {motorcycle.forecastDate
                        ? new Date(motorcycle.forecastDate).toLocaleDateString(
                            "pt-BR",
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex h-full items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          aria-label={`editar-${motorcycle.id}`}
                          onClick={() =>
                            router.push(
                              `/estoque/motocicleta/editar?id=${motorcycle.id}`,
                            )
                          }
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          aria-label={`deletar-${motorcycle.id}`}
                          onClick={() => handleDelete(motorcycle.id)}
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
            {filteredMotorcycles.length} registros
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
        Controle de Estoque — Motocicletas
      </p>
    </div>
  );
}

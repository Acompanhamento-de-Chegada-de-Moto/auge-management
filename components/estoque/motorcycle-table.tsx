"use client";

import dayjs from "dayjs";
import {
  CheckIcon,
  CopyIcon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface MotorcycleItem {
  id: string;
  chassis: string;
  model: string;
  forecastDate: Date | null;
}

interface MotorcycleTableProps {
  motorcycles: MotorcycleItem[];
  totalRows: number;
  page: number;
  totalPages: number;
  filterOptions: { models: string[] };
  filters: { model: string; status: string };
  chassisSearch: string;
  onFilterChange: (key: string, value: string) => void;
  onPageChange: (page: number) => void;
  onChassisSearchChange: (value: string) => void;
}

export default function MotorcycleTable({
  motorcycles,
  totalRows,
  page,
  totalPages,
  filterOptions,
  filters,
  chassisSearch,
  onFilterChange,
  onPageChange,
  onChassisSearchChange,
}: MotorcycleTableProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const statusOptions = ["Em Trânsito", "Chegou", "Atrasada"];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDelete = async (id: string) => {
    router.refresh();
  };

  const perPage = 50;
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalRows);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground mr-1">
          Filtros:
        </span>

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

        <Select
          value={filters.status}
          onValueChange={(v) => onFilterChange("status", v === " " ? "" : v)}
        >
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative ml-auto">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar chassi..."
            value={chassisSearch}
            onChange={(e) => onChassisSearchChange(e.target.value)}
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
            {motorcycles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  {filters.model || filters.status || chassisSearch
                    ? "Nenhum resultado para os filtros atuais."
                    : "Nenhuma motocicleta cadastrada."}
                </TableCell>
              </TableRow>
            ) : (
              motorcycles.map((motorcycle) => {
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
                Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => onPageChange(p)}
                      isActive={page === p}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))
              ) : (
                <>
                  {page > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p: number;
                    if (page <= 3) {
                      p = i + 1;
                    } else if (page >= totalPages - 2) {
                      p = totalPages - 4 + i;
                    } else {
                      p = page - 2 + i;
                    }
                    return p;
                  })
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
        Controle de Estoque — Motocicletas
      </p>
    </div>
  );
}

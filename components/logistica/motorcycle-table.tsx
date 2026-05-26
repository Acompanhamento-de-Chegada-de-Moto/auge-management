"use client";

import { CheckIcon, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { deleteMotorcycleAction } from "@/app/(app)/logistica/actions";
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

interface MotorcycleRow {
  id: string;
  model: string;
  chassis: string;
  arrivalDate: Date | null;
}

interface MotorcycleTableProps {
  motorcycles: MotorcycleRow[];
}

function getArrivalStatus(arrivalDate: Date | null) {
  if (!arrivalDate) {
    return {
      label: "Em Trânsito",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const arrival = new Date(arrivalDate);
  arrival.setHours(0, 0, 0, 0);

  if (arrival <= today) {
    return {
      label: "Chegou",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  return {
    label: "Em Trânsito",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  };
}

export default function MotorcycleTable({ motorcycles }: MotorcycleTableProps) {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    totalItems: motorcycles.length,
    initialPage: 1,
    itemsPerPage: 10,
  });

  const paginatedMotorcycles = useMemo(
    () => motorcycles.slice(paginatedRange.start, paginatedRange.end),
    [motorcycles, paginatedRange.start, paginatedRange.end],
  );

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await deleteMotorcycleAction(id);
  };

  return (
    <div className="w-full">
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Data Chegada</TableHead>
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
                  Nenhuma motocicleta cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              paginatedMotorcycles.map((motorcycle) => {
                const status = getArrivalStatus(motorcycle.arrivalDate);
                return (
                  <TableRow key={motorcycle.id}>
                    <TableCell className="font-medium">{motorcycle.model}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleCopy(motorcycle.chassis, motorcycle.id)}
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
                      {motorcycle.arrivalDate
                        ? new Date(motorcycle.arrivalDate).toLocaleDateString("pt-BR")
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
                              `/logistica/motocicleta/editar?id=${motorcycle.id}`,
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
            {motorcycles.length} registros
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

"use client";

import dayjs from "dayjs";
import { CheckIcon, ChevronLeft, ChevronRight, CopyIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
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

function getArrivalStatus(
  forecastDate: Date | null,
  arrivalStatus?: string | null,
) {
  if (arrivalStatus === "ARRIVED") {
    return {
      label: "Chegou",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  }

  if (arrivalStatus === "DELAYED") {
    return {
      label: "Atrasada",
      color:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
  }

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

  return {
    label: "Chegou",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };
}

interface MotorcycleRow {
  id: string;
  chassi: string;
  model: string;
  forecastArrival: Date | null;
  forecastArrivalStatus: string | null;
}

interface MotorcycleTableProps {
  motorcycles: MotorcycleRow[];
  totalPages: number;
  page: number;
  filterOptions: {
    models: string[];
  };
  activeFilters: {
    model: string;
    status: string;
  };
}

export default function MotorcycleTable({
  motorcycles,
  totalPages,
  page,
  filterOptions,
  activeFilters,
}: MotorcycleTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const updateFilter = (key: "model" | "status", value: string) => {
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

  const clearFilters = () => {
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

  if (motorcycles.length === 0) {
    return (
      <div className="rounded-sm border py-8 text-center text-muted-foreground">
        Nenhuma motocicleta cadastrada.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-2">
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

        <Select
          value={activeFilters.status || "all"}
          onValueChange={(value) => updateFilter("status", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
            <SelectItem value="Chegou">Chegou</SelectItem>
            <SelectItem value="Atrasada">Atrasada</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters} disabled={isPending}>
          Limpar filtros
        </Button>
      </div>

      <div
        className={isPending ? "pointer-events-none opacity-60 transition-opacity" : ""}
      >
        {/* MOBILE: cards (abaixo de md) */}
        <div className="space-y-3 md:hidden">
          {motorcycles.map((motorcycle) => {
            const status = getArrivalStatus(motorcycle.forecastArrival, motorcycle.forecastArrivalStatus);
            return (
              <div key={motorcycle.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{motorcycle.model}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy(motorcycle.chassi, motorcycle.id)}
                      aria-label={`Copiar chassi ${motorcycle.chassi}`}
                      className="group mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
                    >
                      {copiedId === motorcycle.id ? (
                        <span
                          role="status"
                          className="flex items-center gap-1 text-green-600 dark:text-green-400"
                        >
                          <CheckIcon className="size-3.5" />
                          Copiado!
                        </span>
                      ) : (
                        <>
                          <CopyIcon className="size-3.5" />
                          <span className="underline">{motorcycle.chassi}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-1">
                    <Link
                      href={`/inventory/motorcycle/${motorcycle.id}/edit`}
                      aria-label={`Editar motocicleta ${motorcycle.model}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "icon",
                        className: "rounded-full min-h-[44px] min-w-[44px]",
                      })}
                    >
                      <PencilIcon className="size-4" />
                    </Link>
                    <Link
                      href={`/inventory/motorcycle/${motorcycle.id}/delete`}
                      aria-label={`Excluir motocicleta ${motorcycle.model}`}
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

                <div className="mt-3 flex items-center justify-between border-t pt-2">
                  <span className="text-xs text-muted-foreground">
                    Previsão:{" "}
                    {motorcycle.forecastArrival
                      ? new Date(motorcycle.forecastArrival).toLocaleDateString(
                          "pt-BR",
                        )
                      : "—"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
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

        {/* DESKTOP: tabela (md e acima) */}
        <div className="hidden rounded-sm border shadow-sm md:block">
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
              {motorcycles.map((motorcycle) => {
                const status = getArrivalStatus(motorcycle.forecastArrival, motorcycle.forecastArrivalStatus);
                return (
                  <TableRow key={motorcycle.id}>
                    <TableCell className="font-medium">
                      {motorcycle.model}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(motorcycle.chassi, motorcycle.id)
                        }
                        className="group inline-flex items-center gap-1.5 font-mono text-xs transition-colors min-h-[44px]"
                        title="Clique para copiar o chassi"
                      >
                        {copiedId === motorcycle.id ? (
                          <>
                            <CheckIcon className="size-3.5 text-green-600 dark:text-green-400" />
                            <span
                              role="status"
                              className="text-green-600 dark:text-green-400"
                            >
                              Copiado!
                            </span>
                          </>
                        ) : (
                          <>
                            <CopyIcon className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                            <span className="hover:underline">
                              {motorcycle.chassi}
                            </span>
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      {motorcycle.forecastArrival
                        ? new Date(motorcycle.forecastArrival).toLocaleDateString(
                            "pt-BR",
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex h-full items-center gap-1 justify-end">
                        <Link
                          href={`/inventory/motorcycle/${motorcycle.id}/edit`}
                          aria-label={`editar-${motorcycle.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon",
                            className: "rounded-full min-h-[44px] min-w-[44px]",
                          })}
                        >
                          <PencilIcon className="size-4" />
                        </Link>
                        <Link
                          href={`/inventory/motorcycle/${motorcycle.id}/delete`}
                          aria-label={`deletar-${motorcycle.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon",
                            className: "rounded-full min-h-[44px] min-w-[44px]",
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 px-4 py-3 border-t">
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
    </div>
  );
}

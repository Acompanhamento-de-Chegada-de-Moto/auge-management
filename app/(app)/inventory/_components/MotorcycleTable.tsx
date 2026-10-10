"use client";

import {
  Bike,
  CheckIcon,
  CopyIcon,
  LoaderCircle,
  PencilIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteMotorcycleAction } from "@/app/(app)/inventory/_actions/motorcycles";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { FilterViews } from "@/components/ui/filter-views";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
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
import { getArrivalStatus } from "@/lib/bdc-data";
import { formatDateBR } from "@/lib/utils";

interface MotorcycleRow {
  id: string;
  chassi: string;
  model: string;
  forecastArrival: Date | null;
  forecastArrivalStatus: string | null;
}

export interface MotorcycleTableProps {
  motorcycles: MotorcycleRow[];
  total: number;
  totalPages: number;
  page: number;
  statusCounts: {
    total: number;
    inTransit: number;
    arrived: number;
    delayed: number;
  };
  filterOptions: { models: string[] };
  activeFilters: {
    model: string;
    status: string;
    chassis: string;
  };
}

const statusViews = [
  { label: "Todas", value: "all", countKey: "total" },
  { label: "Em trânsito", value: "in-transit", countKey: "inTransit" },
  { label: "Chegou", value: "arrived", countKey: "arrived" },
  { label: "Atrasadas", value: "delayed", countKey: "delayed" },
] as const;

interface MotorcycleTableViewProps extends MotorcycleTableProps {
  isPending: boolean;
  chassisInput: string;
  onChassisInputChange: (value: string) => void;
  onParamsChange: (updates: Record<string, string | null>) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

export default function MotorcycleTable({
  motorcycles,
  total,
  totalPages,
  page,
  statusCounts,
  filterOptions,
  activeFilters,
  isPending,
  chassisInput,
  onChassisInputChange,
  onParamsChange,
  onPageChange,
  onClearFilters,
}: MotorcycleTableViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyChassis(motorcycle: MotorcycleRow) {
    void navigator.clipboard.writeText(motorcycle.chassi).then(() => {
      setCopiedId(motorcycle.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function renderChassis(motorcycle: MotorcycleRow) {
    const copied = copiedId === motorcycle.id;
    return (
      <button
        type="button"
        onClick={() => copyChassis(motorcycle)}
        aria-label={
          copied ? "Chassi copiado" : `Copiar chassi ${motorcycle.chassi}`
        }
        className="inline-flex min-h-11 items-center gap-2 rounded-md font-mono text-xs text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <>
            <CheckIcon className="size-3.5 text-green-600" />
            <span aria-live="polite">Copiado</span>
          </>
        ) : (
          <>
            <CopyIcon className="size-3.5" />
            <span>{motorcycle.chassi}</span>
          </>
        )}
      </button>
    );
  }

  function renderActions(motorcycle: MotorcycleRow) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/inventory/motorcycle/${motorcycle.id}/edit`}
          aria-label={`Editar ${motorcycle.model}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "min-h-10",
          })}
        >
          <PencilIcon className="mr-2 size-4" />
          <span className="hidden lg:inline">Editar</span>
        </Link>
        <ConfirmDeleteDialog
          action={() => deleteMotorcycleAction(motorcycle.id)}
          itemType="Motocicleta"
          itemName={`${motorcycle.model} · ${motorcycle.chassi}`}
          description="A exclusão é permanente e remove esta unidade do estoque."
          triggerLabel={`Excluir ${motorcycle.model}, chassi ${motorcycle.chassi}`}
        />
      </div>
    );
  }

  return (
    <section aria-label="Motocicletas e filtros" className="w-full space-y-4">
      <FilterViews
        label="Visualizações do estoque"
        value={activeFilters.status || "all"}
        isPending={isPending}
        onChange={(value) => onParamsChange({ status: value, arrived: null })}
        views={statusViews.map((view) => ({
          ...view,
          count: statusCounts[view.countKey],
        }))}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-base-300/80 bg-base-100 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar motocicleta pelo chassi"
            placeholder="Buscar pelo chassi"
            value={chassisInput}
            onChange={(event) => onChassisInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter")
                onParamsChange({ chassis: chassisInput.trim() });
            }}
            className="pl-9 pr-9"
            disabled={isPending}
          />
          {chassisInput && (
            <button
              type="button"
              onClick={() => {
                onChassisInputChange("");
                onParamsChange({ chassis: null });
              }}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
        <Select
          value={activeFilters.model || "all"}
          onValueChange={(value) => onParamsChange({ model: value })}
          disabled={isPending}
        >
          <SelectTrigger
            aria-label="Filtrar por modelo"
            className="min-h-11 w-full sm:w-56"
          >
            <SelectValue placeholder="Todos os modelos" />
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
        <Button
          variant="outline"
          onClick={() => onParamsChange({ chassis: chassisInput.trim() })}
          disabled={isPending}
        >
          Buscar
        </Button>
        {(activeFilters.model ||
          activeFilters.status ||
          activeFilters.chassis) && (
          <Button variant="ghost" onClick={onClearFilters} disabled={isPending}>
            Limpar filtros
          </Button>
        )}
      </div>

      <div
        className="flex items-center justify-between border-y border-base-300/70 px-1 py-2 text-sm text-base-content/65"
        aria-live="polite"
      >
        <span>
          {total} {total === 1 ? "motocicleta" : "motocicletas"}
        </span>
        {isPending && (
          <span className="inline-flex items-center gap-2" aria-live="polite">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Atualizando lista…
          </span>
        )}
      </div>

      {motorcycles.length === 0 ? (
        <div
          aria-live="polite"
          className="flex flex-col items-center rounded-xl border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center"
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Bike className="size-5" />
          </div>
          <h2 className="font-medium">
            Nenhuma motocicleta nesta visualização
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Ajuste os filtros ou cadastre uma motocicleta para começar a
            acompanhar o estoque.
          </p>
          {activeFilters.model ||
          activeFilters.status ||
          activeFilters.chassis ? (
            <Button variant="outline" className="mt-4" onClick={onClearFilters}>
              Limpar filtros
            </Button>
          ) : (
            <Button asChild className="mt-4">
              <Link href="/inventory/motorcycle/new">
                Adicionar motocicleta
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div
          aria-busy={isPending}
          className={
            isPending ? "pointer-events-none opacity-80 transition-opacity" : ""
          }
        >
          <div className="space-y-3 md:hidden">
            {motorcycles.map((motorcycle) => {
              const status = getArrivalStatus(
                motorcycle.forecastArrival,
                motorcycle.forecastArrivalStatus,
              );
              return (
                <article
                  key={motorcycle.id}
                  className="rounded-lg border border-base-300/80 bg-base-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium">
                        {motorcycle.model}
                      </h3>
                      {renderChassis(motorcycle)}
                    </div>
                    {renderActions(motorcycle)}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <span className="text-sm text-muted-foreground">
                      Previsão:{" "}
                      {formatDateBR(motorcycle.forecastArrival) ?? "Sem data"}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-base-300/80 bg-base-100 md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motocicleta</TableHead>
                  <TableHead>Chassi</TableHead>
                  <TableHead>Previsão de chegada</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {motorcycles.map((motorcycle) => {
                  const status = getArrivalStatus(
                    motorcycle.forecastArrival,
                    motorcycle.forecastArrivalStatus,
                  );
                  return (
                    <TableRow key={motorcycle.id}>
                      <TableCell className="font-medium">
                        {motorcycle.model}
                      </TableCell>
                      <TableCell>{renderChassis(motorcycle)}</TableCell>
                      <TableCell>
                        {formatDateBR(motorcycle.forecastArrival) ?? "Sem data"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell>{renderActions(motorcycle)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ListPagination
            page={page}
            totalPages={totalPages}
            isPending={isPending}
            onPageChange={onPageChange}
            label="Paginação do estoque"
          />
        </div>
      )}
    </section>
  );
}

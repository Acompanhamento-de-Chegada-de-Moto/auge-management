"use client";

import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { FilterViews } from "@/components/ui/filter-views";
import { ListPagination } from "@/components/ui/list-pagination";
import type { BDCTableProps } from "../bdc-table.types";
import { BDCDesktopTable } from "./bdc-desktop-table";
import { BDCFilters } from "./bdc-filters";
import { BDCMobileCard } from "./bdc-mobile-card";

interface BdcTableViewProps extends BDCTableProps {
  isPending: boolean;
  onParamsChange: (updates: Record<string, string | null>) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

export function BDCTable({
  rows,
  totalClients,
  totalPages,
  page,
  statusCounts,
  filterOptions,
  activeFilters,
  isPending,
  onParamsChange,
  onPageChange,
  onClearFilters,
}: BdcTableViewProps) {
  return (
    <section aria-label="Clientes e filtros" className="min-w-0 space-y-4">
      <FilterViews
        label="Visualizações por chegada"
        value={activeFilters.arrived || "all"}
        isPending={isPending}
        onChange={(value) => onParamsChange({ arrived: value })}
        views={[
          {
            label: "Todos os clientes",
            value: "all",
            count: statusCounts.total,
          },
          { label: "Moto chegou", value: "true", count: statusCounts.arrived },
          {
            label: "Aguardando chegada",
            value: "false",
            count: statusCounts.waiting,
          },
        ]}
      />

      <BDCFilters
        filterOptions={filterOptions}
        activeFilters={activeFilters}
        isPending={isPending}
        onFilterChange={(key, value) => onParamsChange({ [key]: value })}
        onSearch={(value) => onParamsChange({ search: value })}
        onClear={onClearFilters}
      />

      <div
        className="flex items-center justify-between border-y border-base-300/70 px-1 py-2 text-sm text-base-content/65"
        aria-live="polite"
      >
        <span>
          {totalClients} {totalClients === 1 ? "cliente" : "clientes"}
        </span>
        {isPending && (
          <span className="inline-flex items-center gap-2" aria-live="polite">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Atualizando lista…
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <div
          aria-live="polite"
          className="flex flex-col items-center rounded-xl border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center"
        >
          <h2 className="font-medium">Nenhum cliente nesta visualização</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Altere os filtros ou cadastre um cliente para acompanhar o
            atendimento.
          </p>
          <Button variant="outline" className="mt-4" onClick={onClearFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div
          aria-busy={isPending}
          className={
            isPending
              ? "pointer-events-none opacity-80 transition-opacity"
              : undefined
          }
        >
          <div className="space-y-3 md:hidden">
            {rows.map((row) => (
              <BDCMobileCard key={row.rowKey} row={row} />
            ))}
          </div>

          <BDCDesktopTable rows={rows} />

          <ListPagination
            page={page}
            totalPages={totalPages}
            isPending={isPending}
            onPageChange={onPageChange}
            label="Paginação de clientes"
          />
        </div>
      )}
    </section>
  );
}

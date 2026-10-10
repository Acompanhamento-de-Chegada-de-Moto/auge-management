"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataWorkspace } from "@/components/ui/data-workspace";
import { EmptyState } from "@/components/ui/empty-state";

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

      <DataWorkspace
        title="Clientes e motocicletas"
        description="Cada linha representa uma motocicleta vinculada ao cliente."
        total={totalClients}
        unit="clientes"
        busy={isPending}
      >
        <BDCFilters
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          isPending={isPending}
          onFilterChange={(key, value) => onParamsChange({ [key]: value })}
          onSearch={(value) => onParamsChange({ search: value })}
          onClear={onClearFilters}
        />

        {rows.length === 0 ? (
          <EmptyState
            title="Nenhum cliente nesta visualização"
            description="Revise os filtros ou cadastre um cliente para começar a acompanhar suas motocicletas."
            action={
              Object.values(activeFilters).some(Boolean) ? (
                <Button variant="outline" onClick={onClearFilters}>
                  Limpar filtros
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/bdc/client/new">Cadastrar cliente</Link>
                </Button>
              )
            }
          />
        ) : (
          <div
            aria-busy={isPending}
            className={
              isPending
                ? "pointer-events-none opacity-80 transition-opacity"
                : undefined
            }
          >
            <div className="space-y-3 p-3 md:hidden">
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
      </DataWorkspace>
    </section>
  );
}

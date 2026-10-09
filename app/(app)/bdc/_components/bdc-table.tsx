"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

import type { BDCTableProps } from "../bdc-table.types";
import { BDCDesktopTable } from "./bdc-desktop-table";
import { BDCFilters } from "./bdc-filters";
import { BDCMobileCard } from "./bdc-mobile-card";

export function BDCTable({
  rows,
  totalClients,
  totalPages,
  page,
  statusCounts,
  filterOptions,
  activeFilters,
}: BDCTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParams(
    updates: Record<string, string | null>,
    resetPage = true,
  ) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    if (resetPage) {
      params.delete("page");
    }

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname);
    });
  }

  function handlePageChange(nextPage: number) {
    updateParams({ page: String(nextPage) }, false);
  }

  function handleClearFilters() {
    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <section aria-label="Clientes e filtros" className="min-w-0 space-y-4">
      <fieldset className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <legend className="sr-only">Visualizações por chegada</legend>
        {[
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
        ].map((view) => {
          const selected = (activeFilters.arrived || "all") === view.value;
          return (
            <button
              key={view.value}
              type="button"
              aria-pressed={selected}
              disabled={isPending}
              onClick={() => updateParams({ arrived: view.value })}
              className={`flex min-h-20 items-center justify-between rounded-xl border bg-card px-4 text-left shadow-sm transition-colors hover:-translate-y-0.5 hover:shadow-md ${
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "bg-card hover:bg-muted/50"
              }`}
            >
              <span
                className={`text-sm ${selected ? "font-medium" : "text-muted-foreground"}`}
              >
                {view.label}
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {view.count}
              </span>
            </button>
          );
        })}
      </fieldset>

      <BDCFilters
        filterOptions={filterOptions}
        activeFilters={activeFilters}
        isPending={isPending}
        onFilterChange={(key, value) => updateParams({ [key]: value })}
        onSearch={(value) => updateParams({ search: value })}
        onClear={handleClearFilters}
      />

      <div
        className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
        aria-live="polite"
      >
        <span>
          {totalClients} {totalClients === 1 ? "cliente" : "clientes"}
        </span>
        {isPending && <span aria-live="polite">Atualizando lista...</span>}
      </div>

      {rows.length === 0 ? (
        <div
          role="status"
          className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center shadow-sm"
        >
          <h2 className="font-medium">Nenhum cliente nesta visualizaÃ§Ã£o</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Altere os filtros ou cadastre um cliente para acompanhar o
            atendimento.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleClearFilters}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div
          className={
            isPending
              ? "pointer-events-none opacity-60 transition-opacity"
              : undefined
          }
        >
          <div className="space-y-3 md:hidden">
            {rows.map((row) => (
              <BDCMobileCard key={row.rowKey} row={row} />
            ))}
          </div>

          <BDCDesktopTable rows={rows} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                type="button"
                className="min-h-11 rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                disabled={page <= 1 || isPending}
                onClick={() => handlePageChange(page - 1)}
              >
                Anterior
              </button>

              <span className="text-sm text-muted-foreground">
                PÃ¡gina {page} de {totalPages}
              </span>

              <button
                type="button"
                className="min-h-11 rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                disabled={page >= totalPages || isPending}
                onClick={() => handlePageChange(page + 1)}
              >
                PrÃ³xima
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

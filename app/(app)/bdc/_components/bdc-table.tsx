"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import type { BDCTableProps } from "../bdc-table.types";
import { BDCDesktopTable } from "./bdc-desktop-table";
import { BDCFilters } from "./bdc-filters";
import { BDCMobileCard } from "./bdc-mobile-card";

export function BDCTable({
  rows,
  totalPages,
  page,
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
    <div className="min-w-0 space-y-4">
      <BDCFilters
        filterOptions={filterOptions}
        activeFilters={activeFilters}
        isPending={isPending}
        onFilterChange={(key, value) => updateParams({ [key]: value })}
        onSearch={(value) => updateParams({ search: value })}
        onClear={handleClearFilters}
      />

      {rows.length === 0 ? (
        <div className="rounded-lg border py-10 text-center text-sm text-muted-foreground">
          Nenhum registro encontrado.
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
                className="rounded-md border px-3 py-2 text-sm disabled:pointer-events-none disabled:opacity-50"
                disabled={page <= 1 || isPending}
                onClick={() => handlePageChange(page - 1)}
              >
                Anterior
              </button>

              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>

              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm disabled:pointer-events-none disabled:opacity-50"
                disabled={page >= totalPages || isPending}
                onClick={() => handlePageChange(page + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

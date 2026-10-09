import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BDCTable } from "@/app/(app)/bdc/_components/bdc-table";
import { SpreadsheetUploadDialog } from "@/app/(app)/bdc/_components/SpreadsheetUploadDialog";
import { Button } from "@/components/ui/button";
import {
  getBDCFilterOptions,
  getBDCStatusCounts,
  getClientsPaginated,
} from "@/lib/data/client";
import { mapClientsToRows } from "./_lib/client-mapper";
import { BDCPageSkeleton } from "./_components/bdc-page-skeleton";

export const metadata: Metadata = {
  title: "BDC",
};

interface BDCPageProps {
  searchParams: Promise<{
    page?: string;
    sellerName?: string;
    city?: string;
    model?: string;
    search?: string;
    arrived?: string;
  }>;
}

export default async function BDCPage({ searchParams }: BDCPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto min-w-0 w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex min-w-0 flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Relacionamento
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            BDC
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhamento e gestão de clientes e motocicletas.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <SpreadsheetUploadDialog />

          <Button asChild>
            <Link href="/bdc/client/new">
              <PlusIcon className="mr-2 size-4" />
              Adicionar cliente
            </Link>
          </Button>
        </div>
      </header>

      <Suspense fallback={<BDCPageSkeleton />}>
        <RenderClients params={params} />
      </Suspense>
    </main>
  );
}

async function RenderClients({
  params,
}: {
  params: Awaited<BDCPageProps["searchParams"]>;
}) {
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const [paginated, filterOptions, statusCounts] = await Promise.all([
    getClientsPaginated({
      page,
      pageSize: 10,
      sellerName: params.sellerName,
      city: params.city,
      model: params.model,
      search: params.search,
      arrived:
        params.arrived === "true" || params.arrived === "false"
          ? params.arrived
          : undefined,
    }),
    getBDCFilterOptions(),
    getBDCStatusCounts(),
  ]);

  const rows = mapClientsToRows(paginated.clients);
  const filters = {
    sellers: filterOptions.sellers,
    cities: filterOptions.cities,
    models: filterOptions.models,
  };

  return (
    <BDCTable
      rows={rows}
      totalClients={paginated.total}
      totalPages={paginated.totalPages}
      page={page}
      statusCounts={statusCounts}
      filterOptions={filters}
      activeFilters={{
        sellerName: params.sellerName ?? "",
        city: params.city ?? "",
        model: params.model ?? "",
        search: params.search ?? "",
        arrived: params.arrived ?? "",
      }}
    />
  );
}

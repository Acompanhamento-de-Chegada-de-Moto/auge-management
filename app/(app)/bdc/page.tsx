import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BDCTable } from "@/app/(app)/bdc/_components/bdc-table";
import { SpreadsheetUploadDialog } from "@/app/(app)/bdc/_components/SpreadsheetUploadDialog";
import { Button } from "@/components/ui/button";
import { getClientsPaginatedAction } from "./_actions/get-clients-paginated-action";
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
    <main className="min-w-0 w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">BDC</h1>
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
  const result = await getClientsPaginatedAction({
    page: Number(params.page) || 1,
    sellerName: params.sellerName,
    city: params.city,
    model: params.model,
    search: params.search,
    arrived:
      params.arrived === "true" || params.arrived === "false"
        ? params.arrived
        : undefined,
  });

  return (
    <BDCTable
      rows={result.rows}
      totalClients={result.totalClients}
      totalPages={result.totalPages}
      page={result.page}
      statusCounts={result.statusCounts}
      filterOptions={result.filterOptions}
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

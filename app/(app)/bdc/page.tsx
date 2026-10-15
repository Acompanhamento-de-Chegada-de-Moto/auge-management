import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SpreadsheetUploadDialog } from "@/app/(app)/bdc/_components/SpreadsheetUploadDialog";
import { getBdcListing } from "@/app/data/user/get-listings";
import { Page, PageHeader } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { BdcPageClient } from "./_components/BdcPageClient";
import { BDCPageSkeleton } from "./_components/bdc-page-skeleton";
import { mapClientsToRows } from "./_lib/client-mapper";

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

export default function BDCPage({ searchParams }: BDCPageProps) {
  return (
    <Page>
      <PageHeader
        title="Clientes · BDC"
        eyebrow="Operação"
        description="Gerencie atendimentos, acompanhe chegadas e atualize o emplacamento."
        actions={
          <>
            <SpreadsheetUploadDialog />
            <Button asChild>
              <Link href="/bdc/client/new">
                <PlusIcon className="mr-2 size-4" />
                Adicionar cliente
              </Link>
            </Button>
          </>
        }
      />

      <Suspense fallback={<BDCPageSkeleton />}>
        <RenderClients searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}

async function RenderClients({ searchParams }: BDCPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const { paginated, filterOptions, statusCounts } = await getBdcListing({
    page,
    pageSize: 10,
    sellerName: params.sellerName,
    city: params.city,
    model: params.model,
    search: params.search,
    arrived:
      params.arrived === "true" ||
      params.arrived === "false" ||
      params.arrived === "delayed"
        ? params.arrived
        : undefined,
  });

  const rows = mapClientsToRows(paginated.clients);
  const filters = {
    sellers: filterOptions.sellers,
    cities: filterOptions.cities,
    models: filterOptions.models,
  };

  return (
    <BdcPageClient
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

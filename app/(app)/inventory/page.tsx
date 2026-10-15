import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MotorcycleSpreadsheetUploadDialog } from "@/app/(app)/inventory/_components/MotorcycleSpreadsheetUploadDialog";
import { getInventoryListing } from "@/app/data/user/get-listings";
import { Page, PageHeader } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { ListWorkspaceSkeleton } from "@/components/ui/list-workspace-skeleton";
import { normalizeForecastDateRange } from "@/lib/forecast-date-range";
import { InventoryPageClient } from "./_components/InventoryPageClient";

export const metadata: Metadata = {
  title: "Estoque",
};

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Page>
      <PageHeader
        title="Estoque"
        eyebrow="Operação"
        description="Acompanhe chegadas, prazos e motocicletas disponíveis."
        actions={
          <>
            <MotorcycleSpreadsheetUploadDialog />
            <Button asChild>
              <Link href="/inventory/motorcycle/new">
                <PlusIcon className="mr-2 size-4" />
                Adicionar motocicleta
              </Link>
            </Button>
          </>
        }
      />

      <Suspense fallback={<EstoquePageSkeletonLayout />}>
        <RenderMotorcycles searchParams={searchParams} />
      </Suspense>
    </Page>
  );
}

async function RenderMotorcycles({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const dateRange = normalizeForecastDateRange(params);

  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const arrivalFilters = ["in-transit", "arrived", "delayed"] as const;
  const status =
    typeof params.status === "string"
      ? arrivalFilters.find((value) => value === params.status)
      : undefined;
  const { paginated, filterOptions, statusCounts } = await getInventoryListing({
    page,
    pageSize: 10,
    ...dateRange,
    model: typeof params.model === "string" ? params.model.trim() : undefined,
    status,
    chassisSearch:
      typeof params.chassis === "string" ? params.chassis.trim() : undefined,
  });

  return (
    <InventoryPageClient
      motorcycles={paginated.motorcycles}
      total={paginated.total}
      totalPages={paginated.totalPages}
      page={page}
      statusCounts={statusCounts}
      filterOptions={filterOptions}
      activeFilters={{
        ...dateRange,
        model: typeof params.model === "string" ? params.model : "",
        status: typeof params.status === "string" ? params.status : "",
        chassis: typeof params.chassis === "string" ? params.chassis : "",
      }}
    />
  );
}
function EstoquePageSkeletonLayout() {
  return <ListWorkspaceSkeleton views={4} />;
}

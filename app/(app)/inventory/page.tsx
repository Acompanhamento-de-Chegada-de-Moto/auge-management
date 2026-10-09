import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MotorcycleSpreadsheetUploadDialog } from "@/app/(app)/inventory/_components/MotorcycleSpreadsheetUploadDialog";
import { Button } from "@/components/ui/button";
import {
  getEstoqueFilterOptions,
  getMotorcycleStatusCounts,
  getMotorcyclesPaginated,
} from "@/lib/data/motorcycle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MotorcycleTable from "./_components/MotorcycleTable";

export const metadata: Metadata = {
  title: "Estoque",
};

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <main className="mx-auto min-w-0 w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Operação
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Estoque
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe chegadas, prazos e motocicletas disponíveis.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MotorcycleSpreadsheetUploadDialog />

          <Button asChild>
            <Link href="/inventory/motorcycle/new">
              <PlusIcon className="mr-2 size-4" />
              Adicionar motocicleta
            </Link>
          </Button>
        </div>
      </header>

      <Suspense fallback={<EstoquePageSkeletonLayout />}>
        <RenderMotorcycles searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function RenderMotorcycles({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const arrivalFilters = ["in-transit", "arrived", "delayed"] as const;
  const status =
    typeof params.status === "string"
      ? arrivalFilters.find((value) => value === params.status)
      : undefined;
  const [filterOptions, statusCounts, paginated] = await Promise.all([
    getEstoqueFilterOptions(),
    getMotorcycleStatusCounts(),
    getMotorcyclesPaginated({
      page,
      pageSize: 10,
      model: typeof params.model === "string" ? params.model.trim() : undefined,
      status,
      chassisSearch:
        typeof params.chassis === "string" ? params.chassis.trim() : undefined,
    }),
  ]);

  return (
    <MotorcycleTable
      motorcycles={paginated.motorcycles}
      total={paginated.total}
      totalPages={paginated.totalPages}
      page={page}
      statusCounts={statusCounts}
      filterOptions={filterOptions}
      activeFilters={{
        model: typeof params.model === "string" ? params.model : "",
        status: typeof params.status === "string" ? params.status : "",
        chassis: typeof params.chassis === "string" ? params.chassis : "",
      }}
    />
  );
}

export function EstoquePageSkeletonLayout() {
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="w-full animate-pulse">
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead className="hidden md:table-cell">
                Previsão de Chegada
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell className="py-4">
                  <div className="h-4 w-32 rounded bg-muted" />
                </TableCell>

                <TableCell className="py-4">
                  <div className="h-4 w-40 rounded bg-muted/80 font-mono" />
                </TableCell>

                <TableCell className="hidden md:table-cell py-4">
                  <div className="h-4 w-24 rounded bg-muted/60" />
                </TableCell>

                <TableCell className="py-4">
                  <div className="h-5 w-24 rounded-full bg-muted/70" />
                </TableCell>

                <TableCell className="py-4">
                  <div className="flex items-center justify-end gap-2">
                    <div className="size-8 rounded-full bg-muted/80" />
                    <div className="size-8 rounded-full bg-muted/80" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

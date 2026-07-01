import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BDCTable } from "@/app/(app)/bdc/_components/BdcTable";
import { SpreadsheetUploadDialog } from "@/app/(app)/bdc/_components/SpreadsheetUploadDialog";
import { getClientsPaginatedAction } from "@/app/(app)/bdc/actions";

import { EmptyState } from "@/components/general/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  }>;
}

export default async function BDCPage({ searchParams }: BDCPageProps) {
  const params = await searchParams;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="text-muted-foreground block md:hidden">Acompanhamento de Clientes.</p>

        <div className="flex items-center gap-2 flex-wrap">
          <SpreadsheetUploadDialog />

          <Button asChild>
            <Link href="/bdc/client/new">
              <PlusIcon className="mr-2 size-4" />
              Adicionar Cliente
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<BDCPageSkeletonLayout />}>
        <RenderClients params={params} />
      </Suspense>
    </div>
  );
}

async function RenderClients({
  params,
}: {
  params: {
    page?: string;
    sellerName?: string;
    city?: string;
    model?: string;
    search?: string;
  };
}) {
  const result = await getClientsPaginatedAction({
    page: Number(params.page) || 1,
    sellerName: params.sellerName,
    city: params.city,
    model: params.model,
    search: params.search,
  });

  if (result.rows.length === 0) {
    return (
      <EmptyState
        title="Nenhum cliente encontrado"
        description="Para começar adicione um novo cliente"
        buttonText="Adicionar Cliente"
        href="/bdc/client/new"
      />
    );
  }

  return (
    <BDCTable
      rows={result.rows}
      totalPages={result.totalPages}
      page={result.page}
      filterOptions={result.filterOptions}
      activeFilters={{
        sellerName: params.sellerName ?? "",
        city: params.city ?? "",
        model: params.model ?? "",
        search: params.search ?? "",
      }}
    />
  );
}

function BDCPageSkeletonLayout() {
  return (
    <div className="w-full">
      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 w-full sm:w-[180px]" />
        <Skeleton className="h-10 w-full sm:w-[180px]" />
        <Skeleton className="h-10 w-full sm:w-[180px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>

      {/* Tabela */}
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead className="hidden md:table-cell">Cidade</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead className="hidden md:table-cell">
                Data Faturamento
              </TableHead>
              <TableHead>Previsão Chegada</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-44" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

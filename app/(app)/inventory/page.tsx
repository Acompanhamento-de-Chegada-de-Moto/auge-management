import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getMotorcyclesPaginatedAction } from "@/app/(app)/inventory/actions";
import { Button } from "@/components/ui/button";
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="block md:hidden">
          <h1 className="text-2xl font-bold">Estoque</h1>
          <p className="text-muted-foreground mt-1">
            Controle de motocicletas em estoque.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/inventory/motorcycle/new">
            <PlusIcon className="mr-2 size-4" />
            Adicionar Motocicleta
          </Link>
        </Button>
      </div>

      <Suspense fallback={<EstoquePageSkeletonLayout />}>
        <RenderMotorcycles searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function RenderMotorcycles({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const result = await getMotorcyclesPaginatedAction({
    page: Number(params.page) || 1,
    model: typeof params.model === "string" ? params.model : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    chassisSearch: typeof params.chassis === "string" ? params.chassis : undefined,
    arrived: typeof params.arrived === "string" ? params.arrived as "true" | "false" : undefined,
  });

  return (
    <MotorcycleTable
      motorcycles={result.rows}
      totalPages={result.totalPages}
      page={result.page}
      filterOptions={result.filterOptions}
      activeFilters={{
        model: typeof params.model === "string" ? params.model : "",
        status: typeof params.status === "string" ? params.status : "",
        chassis: typeof params.chassis === "string" ? params.chassis : "",
        arrived: typeof params.arrived === "string" ? params.arrived : "",
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

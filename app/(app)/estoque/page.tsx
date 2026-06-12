import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import MotorcycleTable from "@/components/estoque/motorcycle-table";
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
import { getMotorcyclesAction } from "./actions";

export const metadata: Metadata = {
  title: "Estoque",
};

export default function EstoquePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Estoque</h1>
          <p className="text-muted-foreground mt-1">
            Controle de motocicletas em estoque.
          </p>
        </div>
        <Button asChild>
          <Link href="/estoque/motocicleta/novo">
            <PlusIcon className="mr-2 size-4" />
            Adicionar Motocicleta
          </Link>
        </Button>
      </div>
      <Suspense fallback={<MotorcycleTableSkeleton />}>
        <MotorcycleTableWrapper />
      </Suspense>
    </div>
  );
}

async function MotorcycleTableWrapper() {
  const motorcycles = await getMotorcyclesAction();
  return <MotorcycleTable motorcycles={motorcycles} />;
}

function MotorcycleTableSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-[160px] rounded-md" />
        <Skeleton className="h-8 w-[160px] rounded-md" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-[200px] rounded-md" />
        </div>
      </div>
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Previsão de Chegada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
              <TableRow key={`skeleton-${i}`}>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
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

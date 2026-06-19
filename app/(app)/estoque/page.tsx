import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { userGetMotorcycles } from "@/app/data/user/user-get-motorcycles";
import { EmptyState } from "@/components/general/EmptyState";
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

export default async function EstoquePage() {
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

      <Suspense fallback={<EstoquePageSkeletonLayout />}>
        <RenderMotorcycles />
      </Suspense>
    </div>
  );
}

async function RenderMotorcycles() {
  const data = await userGetMotorcycles();

  if (data.length === 0) {
    return (
      <EmptyState
        title="Nenhuma mototcicleta encontrada"
        description="Para começar adicione uma nova motocicleta"
        buttonText="Adicionar Motocicleta"
        href="/bdc/motocicleta/novo"
      />
    );
  }

  return <MotorcycleTable motorcycles={data} />;
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
              <TableHead>Previsão de Chegada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-0 pr-4 text-end">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((index) => (
              <TableRow key={index} className="hover:bg-transparent">
                {/* Coluna: Modelo */}
                <TableCell className="py-4">
                  <div className="h-4 w-32 rounded bg-muted" />
                </TableCell>

                {/* Coluna: Chassi */}
                <TableCell className="py-4">
                  <div className="h-4 w-40 rounded bg-muted/80 font-mono" />
                </TableCell>

                {/* Coluna: Previsão de Chegada */}
                <TableCell className="py-4">
                  <div className="h-4 w-24 rounded bg-muted/60" />
                </TableCell>

                {/* Coluna: Status */}
                <TableCell className="py-4">
                  <div className="h-5 w-24 rounded-full bg-muted/70" />
                </TableCell>

                {/* Coluna: Ações */}
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

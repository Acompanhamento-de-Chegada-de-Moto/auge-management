import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { userGetClients } from "@/app/data/user/user-get-clients";
import { BDCTable } from "@/components/bdc/bdc-table";
import { SpreadsheetUploadDialog } from "@/components/bdc/spreadsheet-upload-dialog";
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

export default function BDCPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-muted-foreground">Acompanhamento de Clientes.</p>

        <div className="flex items-center gap-2">
          <SpreadsheetUploadDialog />

          <Button asChild>
            <Link href="/bdc/cliente/novo">
              <PlusIcon className="mr-2 size-4" />
              Adicionar Cliente
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<BDCPageSkeletonLayout />}>
        <RenderClients />
      </Suspense>
    </div>
  );
}

async function RenderClients() {
  const data = await userGetClients();

  return (
    <>
      {data.length === 0 ? (
        <EmptyState
          title="Nenhum cliente econtrado"
          description="Para começar comece adicionando um novo cliente"
          buttonText="Adicionar Cliente"
          href="/bdc/cliente/novo"
        />
      ) : (
        <BDCTable data={data} />
      )}
    </>
  );
}

function BDCPageSkeletonLayout() {
  return (
    <div className="w-full">
      <div className="rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Chassi</TableHead>
              <TableHead>Data Faturamento</TableHead>
              <TableHead>Previsão Chegada</TableHead>
              <TableHead>Situação</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-6 w-28 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

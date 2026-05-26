import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SpreadsheetUploadDialog } from "@/components/bdc/spreadsheet-upload-dialog";
import BDCTable from "@/components/shadcn-studio/table/bdc-table";
import { Button } from "@/components/ui/button";
import { getClientsAction, searchClientsAction } from "./actions";

export const metadata: Metadata = {
  title: "BDC",
};

export default async function BDCPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = q ? await searchClientsAction(q) : await getClientsAction();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground mt-2 mb-6">
          Acompanhamento de Clientes.
        </p>
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
      <BDCTable clients={clients} query={q} />
    </div>
  );
}

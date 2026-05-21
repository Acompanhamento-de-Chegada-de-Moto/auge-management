import type { Metadata } from "next";
import Link from "next/link";
import BDCTable from "@/components/shadcn-studio/table/bdc-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "BDC",
};

export default function BDCPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground mt-2 mb-6">
          Acompanhamento de Clientes.
        </p>
        <Button asChild>
          <Link href="/bdc/cliente/novo">
            <PlusIcon className="mr-2 size-4" />
            Adicionar Cliente
          </Link>
        </Button>
      </div>
      <BDCTable />
    </div>
  );
}

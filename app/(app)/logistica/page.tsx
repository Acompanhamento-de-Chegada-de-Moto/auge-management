import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import MotorcycleTable from "@/components/logistica/motorcycle-table";
import { getMotorcyclesAction } from "./actions";

export const metadata: Metadata = {
  title: "Logística",
};

export default async function LogisticaPage() {
  const motorcycles = await getMotorcyclesAction();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Logística</h1>
          <p className="text-muted-foreground mt-1">
            Controle de motocicletas em estoque e em trânsito.
          </p>
        </div>
        <Button asChild>
          <Link href="/logistica/motocicleta/novo">
            <PlusIcon className="mr-2 size-4" />
            Adicionar Motocicleta
          </Link>
        </Button>
      </div>
      <MotorcycleTable motorcycles={motorcycles} />
    </div>
  );
}

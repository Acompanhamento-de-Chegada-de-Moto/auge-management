import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import MotorcycleTable from "@/components/estoque/motorcycle-table";
import { Button } from "@/components/ui/button";
import { getMotorcyclesAction } from "./actions";

export const metadata: Metadata = {
  title: "Estoque",
};

export default async function EstoquePage() {
  const motorcycles = await getMotorcyclesAction();

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
      <MotorcycleTable motorcycles={motorcycles} />
    </div>
  );
}

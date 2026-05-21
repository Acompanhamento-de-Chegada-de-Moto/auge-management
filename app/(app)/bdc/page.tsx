"use client";

import { useState } from "react";
import { CustomerDialog } from "@/components/bdc/customer-dialog";
import BDCTable from "@/components/shadcn-studio/table/bdc-table";
import { Button } from "@/components/ui/button";

export default function BDCPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground mt-2 mb-6">
          Acompanhamento de Clientes.
        </p>
        <Button onClick={() => setIsDialogOpen(true)}>Adicionar Cliente</Button>
      </div>
      <BDCTable />
      <CustomerDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}

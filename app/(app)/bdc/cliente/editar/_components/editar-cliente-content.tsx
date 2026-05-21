"use client";

import { CustomerForm } from "@/components/bdc/customer-form";
import type { CustomerFormData } from "@/validators/customer-schema";

interface EditarClienteContentProps {
  initialData: Partial<CustomerFormData>;
  clientName: string;
  action: (data: unknown) => Promise<unknown>;
}

export function EditarClienteContent({
  initialData,
  clientName,
  action,
}: EditarClienteContentProps) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Cliente</h1>
        <p className="text-muted-foreground">Editando: {clientName}</p>
      </div>

      <CustomerForm initialData={initialData} mode="edit" action={action} />
    </>
  );
}

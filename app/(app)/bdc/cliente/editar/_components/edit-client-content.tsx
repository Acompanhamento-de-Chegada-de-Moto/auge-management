"use client";

import { CustomerForm } from "@/components/bdc/customer-form";
import { EditClientSkeleton } from "@/components/bdc/edit-client-skeleton";
import { useClientById } from "@/hooks/use-client-by-id";
import type { CustomerFormData } from "@/validators/customer-schema";

interface EditClientContentProps {
  clientId: string;
  action: (data: unknown) => Promise<unknown>;
}

export function EditClientContent({
  clientId,
  action,
}: EditClientContentProps) {
  const { data: client, isLoading, error } = useClientById(clientId);

  if (isLoading) {
    return <EditClientSkeleton />;
  }

  if (error || !client) {
    return (
      <div className="text-center py-12 text-destructive">
        Erro ao carregar dados do cliente. Tente novamente.
      </div>
    );
  }

  const motorcycle = client.motorcycles[0];

  const initialData: Partial<CustomerFormData> = {
    chassis: motorcycle?.chassis ?? "",
    customerName: client.name,
    sellerName: client.sellerName,
    city: client.city,
    model: motorcycle?.model ?? "",
    billingDate: client.billingDate ?? undefined,
    hasArrived: !!motorcycle?.arrivalDate,
    arrivalDate: motorcycle?.arrivalDate ?? undefined,
    registrationStatus: (motorcycle?.registrationStatus === "PENDING"
      ? "Pendente"
      : motorcycle?.registrationStatus === "IN_PROGRESS"
        ? "Em Emplacamento"
        : "Emplacado") as "Pendente" | "Em Emplacamento" | "Emplacado",
    plateDate: motorcycle?.registrationStatusDate ?? undefined,
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Cliente</h1>
        <p className="text-muted-foreground">Editando: {client.name}</p>
      </div>

      <CustomerForm initialData={initialData} mode="edit" action={action} />
    </>
  );
}

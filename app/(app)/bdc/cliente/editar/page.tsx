import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/bdc/customer-form";
import { formatCPF } from "@/lib/cpf";
import { getClientByIdAction, updateClientAction } from "./actions";
import type { CustomerFormData } from "@/validators/customer-schema";

export const metadata: Metadata = {
  title: "Editar Cliente",
};

export default async function EditarClientePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params.id;

  if (!id) {
    notFound();
  }

  const client = await getClientByIdAction(id);

  if (!client) {
    notFound();
  }

  const motorcycle = client.motorcycles[0];

  const initialData: Partial<CustomerFormData> = {
    chassis: motorcycle?.chassis ?? "",
    cpf: client.cpf ? formatCPF(client.cpf) : "",
    customerName: client.name,
    sellerName: client.sellerName,
    city: client.city,
    model: motorcycle?.model ?? "",
    billingDate: client.billingDate ?? undefined,
    forecastDate: motorcycle?.forecastDate ?? undefined,
    registrationStatus: (motorcycle?.registrationStatus === "NO_PLATE"
      ? "Sem Emplacamento"
      : motorcycle?.registrationStatus === "PLATING"
        ? "Emplacando"
        : "Emplacado") as "Sem Emplacamento" | "Emplacando" | "Emplacado",
    plateDate: motorcycle?.registrationStatusDate ?? undefined,
  };

  const boundAction = updateClientAction.bind(null, id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Cliente</h1>
        <p className="text-muted-foreground">Editando: {client.name}</p>
      </div>

      <CustomerForm initialData={initialData} mode="edit" action={boundAction} />
    </div>
  );
}

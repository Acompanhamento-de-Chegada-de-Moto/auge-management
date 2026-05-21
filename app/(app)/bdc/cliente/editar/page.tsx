import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditarClienteContent } from "./_components/editar-cliente-content";
import { getClientByIdAction, updateClientAction } from "./actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

  const initialData = {
    chassi: motorcycle?.chassis ?? "",
    cliente: client.name,
    vendedor: client.sellerName,
    cidade: client.city,
    modelo: motorcycle?.model ?? "",
    dataFaturamento: client.billingDate ?? undefined,
    motoChegou: !!motorcycle?.arrivalDate,
    dataChegada: motorcycle?.arrivalDate ?? undefined,
    statusRegistro: (motorcycle?.registrationStatus === "PENDING"
      ? "Pendente"
      : motorcycle?.registrationStatus === "IN_PROGRESS"
        ? "Em Emplacamento"
        : "Emplacado") as "Pendente" | "Em Emplacamento" | "Emplacado",
    dataEmplacamento: motorcycle?.registrationStatusDate ?? undefined,
  };

  const boundAction = updateClientAction.bind(null, id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/bdc">BDC</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Cliente</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Suspense
        fallback={<p className="text-muted-foreground">Carregando...</p>}
      >
        <EditarClienteContent
          initialData={initialData}
          clientName={client.name}
          action={boundAction}
        />
      </Suspense>
    </div>
  );
}

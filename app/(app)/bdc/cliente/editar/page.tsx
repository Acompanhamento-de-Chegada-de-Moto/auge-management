import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { EditClientContent } from "./_components/edit-client-content";
import { getClientByIdAction, updateClientAction } from "./actions";

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
        <EditClientContent
          initialData={initialData}
          clientName={client.name}
          action={boundAction}
        />
      </Suspense>
    </div>
  );
}

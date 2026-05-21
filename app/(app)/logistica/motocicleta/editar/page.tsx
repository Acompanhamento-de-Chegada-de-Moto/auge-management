import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MotorcycleEditForm } from "@/components/logistica/motorcycle-edit-form";
import { getMotorcycleByIdAction, updateMotorcycleAction } from "./actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Editar Motocicleta",
};

export default async function EditarMotocicletaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params.id;

  if (!id) {
    notFound();
  }

  const motorcycle = await getMotorcycleByIdAction(id);

  if (!motorcycle) {
    notFound();
  }

  const initialData = {
    chassis: motorcycle.chassis,
    model: motorcycle.model,
    arrivalDate: motorcycle.arrivalDate ?? undefined,
  };

  const boundAction = updateMotorcycleAction.bind(null, id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/logistica">Logística</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar Motocicleta</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Motocicleta</h1>
        <p className="text-muted-foreground">
          Editando: {motorcycle.model} — {motorcycle.chassis}
        </p>
      </div>

      <Suspense
        fallback={<p className="text-muted-foreground">Carregando...</p>}
      >
        <MotorcycleEditForm initialData={initialData} action={boundAction} />
      </Suspense>
    </div>
  );
}

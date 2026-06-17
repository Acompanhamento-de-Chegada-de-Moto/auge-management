import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MotorcycleEditForm } from "@/components/estoque/motorcycle-edit-form";

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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Motocicleta</h1>
        <p className="text-muted-foreground">
          Editando: 'motorcycle.model — motorcycle.chassis'
        </p>
      </div>

      <Suspense
        fallback={<p className="text-muted-foreground">Carregando...</p>}
      ></Suspense>
    </div>
  );
}

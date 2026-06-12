import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditClientContent } from "./_components/edit-client-content";
import { updateClientAction } from "./actions";

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

  const boundAction = updateClientAction.bind(null, id);

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <Suspense
        fallback={<p className="text-muted-foreground">Carregando...</p>}
      >
        <EditClientContent clientId={id} action={boundAction} />
      </Suspense>
    </div>
  );
}

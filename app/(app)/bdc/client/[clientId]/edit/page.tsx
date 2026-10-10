import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/app/data/user/require-auth";
import { Page, PageHeader } from "@/components/layout/Page";
import { buttonVariants } from "@/components/ui/button";
import { getClientById } from "@/lib/data/client";
import { EditClientForm } from "./_components/EditClientForm";

export const metadata: Metadata = {
  title: "Editar Cliente",
};

export default async function EditarClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ motorcycleId?: string }>;
}) {
  await requireAuth();
  const { clientId } = await params;
  const { motorcycleId } = await searchParams;

  if (!clientId) {
    notFound();
  }

  const client = await getClientById(clientId);

  if (!client) {
    notFound();
  }

  const selectedMotorcycle =
    (motorcycleId
      ? client.motorcycles.find((m) => m.id === motorcycleId)
      : undefined) ??
    client.motorcycles[0] ??
    null;

  return (
    <Page>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <PageHeader
          title="Editar cliente"
          description={`Atualize os dados de ${client.name} e o acompanhamento da motocicleta.`}
          actions={
            <Link
              href="/bdc"
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft className="mr-2 size-4" />
              Voltar para clientes
            </Link>
          }
        />
        <EditClientForm
          client={client}
          selectedMotorcycle={selectedMotorcycle}
        />
      </div>
    </Page>
  );
}

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    <main className="mx-auto min-w-0 w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <header className="flex flex-col gap-4 border-b border-border/70 pb-6">
          <Link
            href="/bdc"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "-ml-3 w-fit text-muted-foreground",
            })}
          >
            <ArrowLeft className="mr-2 size-4" /> Voltar para clientes
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Editar cliente
            </h1>
            <p className="text-sm text-muted-foreground">
              Atualize os dados de {client.name} e o acompanhamento da
              motocicleta.
            </p>
          </div>
        </header>
        <EditClientForm
          client={client}
          selectedMotorcycle={selectedMotorcycle}
        />
      </div>
    </main>
  );
}

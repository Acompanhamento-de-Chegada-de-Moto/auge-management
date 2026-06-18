import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { userGetClient } from "@/app/data/user/user-get-client";
import { buttonVariants } from "@/components/ui/button";
import { EditClientForm } from "./_components/EditClientForm";

export const metadata: Metadata = {
  title: "Editar Cliente",
};

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const data = await userGetClient(clientId);

  if (!clientId) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar Cliente</h1>
        <Link
          title="voltar"
          href="/bdc"
          className={buttonVariants({
            variant: "secondary",
          })}
        >
          <ArrowLeft className="size-4 mr-2" /> Voltar
        </Link>
      </div>
      <EditClientForm data={data} clientId={clientId} />
    </div>
  );
}

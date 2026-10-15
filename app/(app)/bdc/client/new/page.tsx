import { ArrowLeft, ClipboardPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/Page";

import { buttonVariants } from "@/components/ui/button";
import { CreateClientForm } from "../_components/create-client-form";

export const metadata: Metadata = {
  title: "Novo Cliente",
  description:
    "Formulário de cadastro de novo cliente e verificação de estoque.",
};

export default async function NewClientPage() {
  return (
    <Page>
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <PageHeader
          title="Novo Cliente"
          description={
            "Cadastre o cliente e consulte os dados da motocicleta no estoque."
          }
          icon={<ClipboardPlus className="size-5" />}
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

        <CreateClientForm />
      </div>
    </Page>
  );
}

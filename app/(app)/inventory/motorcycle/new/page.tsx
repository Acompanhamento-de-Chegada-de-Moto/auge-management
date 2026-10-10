import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/Page";
import { buttonVariants } from "@/components/ui/button";
import { CreateMotorcycleForm } from "../_components/CreateMotorcycleForm";

export const metadata: Metadata = {
  title: "Nova Motocicleta",
};

export default function NovaMotocicletaPage() {
  return (
    <Page>
      <PageHeader
        title="Adicionar motocicleta"
        description={
          "Cadastre os dados da unidade e acompanhe a previsão de chegada."
        }
        actions={
          <Link
            href="/inventory"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="mr-2 size-4" />
            Voltar ao estoque
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-4xl">
        <CreateMotorcycleForm />
      </div>
    </Page>
  );
}

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { userGetMotorcycle } from "@/app/data/user/user-get-motorcycle";
import { buttonVariants } from "@/components/ui/button";
import { CreateClientForm } from "../_components/CreateClientForm";
import { CreateClientAction } from "./actions";

export const metadata: Metadata = {
  title: "Novo Cliente",
};

export default function NovoClientePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold">Cadastro de Cliente</h1>
          <p className="text-muted-foreground">
            Consulte o chassi e preencha os dados do cliente.
          </p>
        </div>
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

      <CreateClientForm
        action={CreateClientAction}
        searchChassisAction={userGetMotorcycle}
      />
    </div>
  );
}

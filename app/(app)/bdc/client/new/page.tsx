import { ArrowLeft, ClipboardPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { userGetMotorcycle } from "@/app/data/user/user-get-motorcycle";
import { buttonVariants } from "@/components/ui/button";
import { CreateClientForm } from "../_components/create-client-form";
import { CreateClientAction } from "./actions";

export const metadata: Metadata = {
  title: "Novo Cliente",
  description:
    "Formulário de cadastro de novo cliente e verificação de estoque.",
};

export default async function NewClientPage() {
  return (
    <main
      className="min-w-0 px-4 py-6 sm:px-6 lg:px-8"
      aria-labelledby="page-title"
    >
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-col gap-4">
          <div>
            <Link
              href="/bdc"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "-ml-3 text-muted-foreground",
              })}
            >
              <ArrowLeft className="mr-2 size-4" />
              Voltar para clientes
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-card">
              <ClipboardPlus className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0 space-y-1">
              <h1
                id="page-title"
                className="text-2xl font-semibold tracking-tight"
              >
                Novo Cliente
              </h1>

              <p className="text-sm text-muted-foreground">
                Cadastre o cliente e consulte os dados da motocicleta no
                estoque.
              </p>
            </div>
          </div>
        </header>

        <CreateClientForm
          action={CreateClientAction}
          searchChassisAction={userGetMotorcycle}
        />
      </div>
    </main>
  );
}

import { ArrowLeft, ClipboardPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { CreateClientForm } from "../_components/create-client-form";

export const metadata: Metadata = {
  title: "Novo Cliente",
  description:
    "Formulário de cadastro de novo cliente e verificação de estoque.",
};

export default async function NewClientPage() {
  return (
    <main
      className="mx-auto min-w-0 w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8"
      aria-labelledby="page-title"
    >
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
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

        <CreateClientForm />
      </div>
    </main>
  );
}

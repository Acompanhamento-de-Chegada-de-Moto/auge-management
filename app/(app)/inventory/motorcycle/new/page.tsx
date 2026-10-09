import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CreateMotorcycleForm } from "../_components/CreateMotorcycleForm";

export const metadata: Metadata = {
  title: "Nova Motocicleta",
};

export default function NovaMotocicletaPage() {
  return (
    <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Adicionar motocicleta
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre os dados da unidade e acompanhe a previsão de chegada.
          </p>
        </div>
        <Link
          href="/inventory"
          className={buttonVariants({
            variant: "outline",
          })}
        >
          <ArrowLeft className="mr-2 size-4" /> Voltar ao estoque
        </Link>
      </header>
      <CreateMotorcycleForm />
    </main>
  );
}

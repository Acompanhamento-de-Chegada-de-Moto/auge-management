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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-2xl font-bold">Cadastro de Motocicleta</h1>
          <p className="text-muted-foreground">
            Cadastre uma nova motocicleta no estoque.
          </p>
        </div>
        <Link
          title="voltar"
          href="/estoque"
          className={buttonVariants({
            variant: "secondary",
          })}
        >
          <ArrowLeft className="size-4 mr-2" /> Voltar
        </Link>
      </div>
      <CreateMotorcycleForm />
    </div>
  );
}

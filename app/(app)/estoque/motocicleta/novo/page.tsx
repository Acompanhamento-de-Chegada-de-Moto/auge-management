import type { Metadata } from "next";
import { MotorcycleForm } from "@/components/estoque/motorcycle-form";
import { createMotorcycleAction } from "./actions";

export const metadata: Metadata = {
  title: "Nova Motocicleta",
};

export default function NovaMotocicletaPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cadastro de Motocicleta</h1>
        <p className="text-muted-foreground">
          Cadastre uma nova motocicleta no estoque.
        </p>
      </div>

      <MotorcycleForm action={createMotorcycleAction} />
    </div>
  );
}

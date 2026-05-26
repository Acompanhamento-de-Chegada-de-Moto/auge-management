import type { Metadata } from "next";
import { MotorcycleForm } from "@/components/logistica/motorcycle-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { createMotorcycleAction } from "./actions";

export const metadata: Metadata = {
  title: "Nova Motocicleta",
};

export default function NovaMotocicletaPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/logistica">Logística</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Nova Motocicleta</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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

"use client";

import { CustomerForm } from "@/components/bdc/customer-form";
import { bdcItems } from "@/lib/bdc-data";
import type { CustomerFormData } from "@/validators/customer-schema";
import { useSearchParams } from "next/navigation";

export function EditarClienteContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const item = bdcItems.find((i) => i.id === id);

  const initialData: Partial<CustomerFormData> | undefined = item
    ? {
        chassi: item.chassi,
        cliente: item.cliente,
        vendedor: item.vendedor,
        cidade: item.cidade,
        modelo: item.modelo,
        dataFaturamento: undefined,
        motoChegou: true,
        dataChegada: undefined,
        statusRegistro: "Pendente",
        dataEmplacamento: undefined,
      }
    : undefined;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Cliente</h1>
        <p className="text-muted-foreground">
          {item
            ? `Editando: ${item.cliente} - ${item.modelo}`
            : "Cliente não encontrado."}
        </p>
      </div>

      {item ? (
        <CustomerForm initialData={initialData} mode="edit" />
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">
            Cliente não encontrado. Verifique o ID na URL.
          </p>
        </div>
      )}
    </>
  );
}

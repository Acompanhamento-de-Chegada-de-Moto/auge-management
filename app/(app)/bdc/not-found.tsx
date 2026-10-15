import { ResourceNotFound } from "@/components/layout/ResourceNotFound";

export default function BdcNotFound() {
  return (
    <ResourceNotFound
      returnHref="/bdc"
      returnLabel="Voltar à lista de clientes"
    />
  );
}

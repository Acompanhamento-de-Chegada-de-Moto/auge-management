import { ResourceNotFound } from "@/components/layout/ResourceNotFound";

export default function InventoryNotFound() {
  return (
    <ResourceNotFound
      title="Motocicleta não encontrada"
      returnHref="/inventory"
      returnLabel="Voltar ao estoque"
    />
  );
}

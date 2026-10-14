import { ResourceNotFound } from "@/components/layout/ResourceNotFound";

export default function NotFound() {
  return (
    <ResourceNotFound
      title="Página não encontrada"
      description="O endereço pode ter mudado ou o conteúdo não está mais disponível. Volte ao início para continuar."
    />
  );
}

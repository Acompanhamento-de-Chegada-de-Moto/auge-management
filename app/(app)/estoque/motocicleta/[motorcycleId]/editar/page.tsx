import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { userGetMotorcycleById } from "@/app/data/user/user-get-motorcycle-by-id";
import { buttonVariants } from "@/components/ui/button";
import { EditMotorcycleForm } from "./_components/EditMotorcycleForm";

export const metadata: Metadata = {
  title: "Editar Motocicleta",
};

export default async function EditarMotocicletaPage({
  params,
}: {
  params: Promise<{ motorcycleId: string }>;
}) {
  const { motorcycleId } = await params;
  const data = await userGetMotorcycleById(motorcycleId);

  if (!data) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Editar Motocicleta</h1>
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

      <EditMotorcycleForm initialData={data} motorcycleId={motorcycleId} />
    </div>
  );
}

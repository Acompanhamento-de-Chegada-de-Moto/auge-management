import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getMotorcycleByIdWithClient } from "@/lib/data/motorcycle";
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

  if (!motorcycleId) {
    notFound();
  }

  const motorcycle = await getMotorcycleByIdWithClient(motorcycleId);

  if (!motorcycle) {
    notFound();
  }

  return (
    <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Editar motocicleta
          </h1>
          <p className="text-sm text-muted-foreground">
            {motorcycle.model} ·{" "}
            <span className="font-mono">{motorcycle.chassi}</span>
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

      <EditMotorcycleForm motorcycle={motorcycle} />
    </main>
  );
}

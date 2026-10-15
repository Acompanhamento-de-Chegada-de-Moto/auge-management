import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/app/data/user/require-auth";
import { Page, PageHeader } from "@/components/layout/Page";
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
  await requireAuth();
  const { motorcycleId } = await params;

  if (!z.string().uuid().safeParse(motorcycleId).success) {
    notFound();
  }

  const motorcycle = await getMotorcycleByIdWithClient(motorcycleId);

  if (!motorcycle) {
    notFound();
  }

  return (
    <Page>
      <PageHeader
        title="Editar motocicleta"
        description={`${motorcycle.model} · ${motorcycle.chassi}`}
        actions={
          <Link
            href="/inventory"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="mr-2 size-4" />
            Voltar ao estoque
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-4xl">
        <EditMotorcycleForm motorcycle={motorcycle} />
      </div>
    </Page>
  );
}

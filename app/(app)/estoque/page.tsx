import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { EstoquePageClient } from "./_components/estoque-page-client";

export const metadata: Metadata = {
  title: "Estoque",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    model?: string;
    status?: string;
    chassis?: string;
  }>;
}

export default async function EstoquePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const model = params.model;
  const status = params.status as
    | "Em Trânsito"
    | "Chegou"
    | "Atrasada"
    | undefined;
  const chassisSearch = params.chassis;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Estoque</h1>
          <p className="text-muted-foreground mt-1">
            Controle de motocicletas em estoque.
          </p>
        </div>
        <Button asChild>
          <Link href="/estoque/motocicleta/novo">
            <PlusIcon className="mr-2 size-4" />
            Adicionar Motocicleta
          </Link>
        </Button>
      </div>
    </div>
  );
}

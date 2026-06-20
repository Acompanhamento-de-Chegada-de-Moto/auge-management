import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ClientCard } from "@/components/home/ClientCard";
import { SearchForm } from "@/components/home/SearchForm";
import { searchClients } from "@/lib/data/client";

export const metadata: Metadata = {
  title: "Acompanhamento",
};

export default async function AcompanhamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q;
  const clients = query ? await searchClients(query) : [];

  return (
    <div className="flex min-h-full flex-col items-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Image src="/logo-auge.png" alt="Auge" width={80} height={80} className="size-20 object-contain" />
          <h1 className="text-2xl font-bold tracking-tight">
            Acompanhamento de Motocicletas
          </h1>
          <p className="text-muted-foreground">
            Consulte o status da motocicleta pelo CPF do cliente.
          </p>
        </div>

        <SearchForm defaultValue={query} />

        {query && clients.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum cliente encontrado para &quot;{query}&quot;.
          </p>
        )}

        {clients.length > 0 && (
          <div className="flex w-full flex-col gap-4">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto pt-12">
        <Link
          href="/bdc"
          className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          Área administrativa →
        </Link>
      </div>
    </div>
  );
}

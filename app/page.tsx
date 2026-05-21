import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm } from "@/components/home/search-form";
import { ClientCard } from "@/components/home/client-card";
import { searchClientsByName } from "@/lib/data/client";
import { PackageSearch } from "lucide-react";

export const metadata: Metadata = {
  title: "Consulta de Status",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q;
  const clients = query ? await searchClientsByName(query) : [];

  return (
    <div className="flex min-h-full flex-col items-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <PackageSearch className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Acompanhamento de Motocicletas
          </h1>
          <p className="text-muted-foreground">
            Consulte o status da sua motocicleta pelo nome do cliente.
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

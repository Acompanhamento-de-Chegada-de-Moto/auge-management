import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { searchClients } from "@/lib/data/client";
import { getSetting } from "@/lib/data/settings";
import { ClientCard } from "./_components/ClientCard";
import { SearchForm } from "./_components/SearchForm";

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

  const logoUrl = await getSetting("logo_url");

  return (
    <main className="relative flex min-h-full flex-col items-center overflow-hidden bg-gradient-to-b from-primary/[0.04] via-background to-background px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl"
      />
      <div className="relative flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl border bg-card shadow-sm">
            <Image
              src={logoUrl || "/logo-auge.png"}
              alt="Auge"
              width={60}
              height={60}
              className="size-14 object-contain"
            />
          </div>
          <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Acompanhamento de Motocicletas
          </h1>
          <p className="text-muted-foreground">
            Consulte o status da motocicleta pelo CPF ou CNPJ do cliente.
          </p>
        </div>

        <SearchForm defaultValue={query} />

        {query && clients.length === 0 && (
          <output className="block w-full rounded-xl border bg-card px-5 py-4 text-center text-sm text-muted-foreground">
            Nenhum cliente encontrado para &quot;{query}&quot;.
          </output>
        )}

        {clients.length > 0 && (
          <div className="flex w-full flex-col gap-4">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>

      <div className="relative mt-auto pt-12">
        <Link
          href="/bdc"
          className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          Área administrativa →
        </Link>
      </div>
    </main>
  );
}

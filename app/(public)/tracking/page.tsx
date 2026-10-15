import { SearchCheck } from "lucide-react";
import type { Metadata } from "next";
import { searchClients } from "@/lib/data/client";
import { getSetting } from "@/lib/data/settings";
import { documentSearchSchema } from "@/validators/document-search-schema";
import { ClientCard } from "./_components/ClientCard";
import { SearchForm } from "./_components/SearchForm";
import { TrackingShell } from "./_components/TrackingShell";

export const metadata: Metadata = { title: "Acompanhamento" };
export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const parsed = query
    ? documentSearchSchema.safeParse({ document: query })
    : null;
  const [logoUrl, clients] = await Promise.all([
    getSetting("logo_url"),
    parsed?.success ? searchClients(parsed.data.document) : Promise.resolve([]),
  ]);
  const invalid =
    parsed && !parsed.success
      ? "Informe um CPF ou CNPJ válido para consultar."
      : undefined;
  return (
    <TrackingShell logoUrl={logoUrl}>
      <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-lg space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Consulta para vendedores
          </p>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Consulte a motocicleta do cliente
          </h1>
          <p className="text-base leading-7 text-base-content/65">
            Consulte a previsão de chegada, o recebimento e o emplacamento em um
            só lugar.
          </p>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-7">
          <h2 className="mb-2 text-lg font-semibold">Consultar atendimento</h2>
          <p className="mb-6 text-sm leading-6 text-base-content/65">
            Informe o CPF ou CNPJ do cliente.
          </p>
          <SearchForm key={query} defaultValue={query} initialError={invalid} />
        </div>
      </section>
      {parsed?.success && clients.length === 0 && (
        <section
          className="rounded-2xl border border-base-300 bg-base-100 p-8 text-center"
          aria-label="Resultado da consulta"
        >
          <SearchCheck
            className="mx-auto mb-4 size-8 text-base-content/40"
            aria-hidden="true"
          />
          <h2 className="font-semibold">Nenhum atendimento encontrado</h2>
          <p className="mt-2 text-sm text-base-content/65">
            Confira o CPF ou CNPJ informado e tente novamente.
          </p>
        </section>
      )}
      {clients.length > 0 && (
        <section className="space-y-5" aria-label="Resultado da consulta">
          <h2 className="text-lg font-semibold">Atendimento do cliente</h2>
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </section>
      )}
    </TrackingShell>
  );
}

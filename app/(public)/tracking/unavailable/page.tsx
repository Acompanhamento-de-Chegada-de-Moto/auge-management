import { FileQuestion } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSetting } from "@/lib/data/settings";
import { TrackingShell } from "../_components/TrackingShell";

export const metadata: Metadata = { title: "Acompanhamento indisponível" };
export default async function TrackingUnavailablePage() {
  const logoUrl = await getSetting("logo_url");
  return (
    <TrackingShell logoUrl={logoUrl}>
      <section className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-2xl border border-base-300 bg-base-100 px-6 py-12 text-center">
        <span className="rounded-2xl bg-base-200 p-4 text-base-content/50">
          <FileQuestion className="size-9" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold">Acompanhamento indisponível</h1>
        <p className="text-sm leading-6 text-base-content/65">
          Este link não está mais disponível. Faça uma nova consulta com o CPF
          ou CNPJ do cadastro para encontrar o atendimento do cliente.
        </p>
        <Link href="/tracking" className="btn btn-primary mt-2">
          Fazer nova consulta
        </Link>
      </section>
    </TrackingShell>
  );
}

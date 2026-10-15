import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getClientById } from "@/lib/data/client";
import { getSetting } from "@/lib/data/settings";
import { ClientCard } from "../../_components/ClientCard";
import { TrackingShell } from "../../_components/TrackingShell";

export const metadata: Metadata = { title: "Atendimento do cliente" };
export default async function ClientTrackingPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  if (!z.string().uuid().safeParse(clientId).success) notFound();
  const client = await getClientById(clientId);
  if (!client) notFound();
  const logoUrl = await getSetting("logo_url");
  return (
    <TrackingShell logoUrl={logoUrl} back>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Acompanhamento
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Atendimento do cliente
        </h1>
      </div>
      <ClientCard client={client} />
    </TrackingShell>
  );
}

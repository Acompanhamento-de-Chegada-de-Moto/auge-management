import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import { publicGetMotorcycleById } from "@/app/data/public/public-get-motorcycle";
import { getSetting } from "@/lib/data/settings";
import { ClientDetails } from "../../_components/ClientDetails";
import { MotorcycleCard } from "../../_components/MotorcycleCard";
import { TrackingShell } from "../../_components/TrackingShell";

export const metadata: Metadata = { title: "Situação da motocicleta" };
export default async function MotorcycleTrackingPage({
  params,
}: {
  params: Promise<{ motorcycleId: string }>;
}) {
  const { motorcycleId } = await params;
  if (!z.string().uuid().safeParse(motorcycleId).success)
    redirect("/tracking/unavailable");
  const motorcycle = await publicGetMotorcycleById(motorcycleId);
  if (!motorcycle?.client) redirect("/tracking/unavailable");
  const logoUrl = await getSetting("logo_url");
  return (
    <TrackingShell logoUrl={logoUrl} back>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Detalhes do acompanhamento
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Situação da motocicleta
        </h1>
      </div>
      <MotorcycleCard motorcycle={motorcycle} showActions={false} />
      <ClientDetails client={motorcycle.client} />
    </TrackingShell>
  );
}

import { Calendar, MapPin, User } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { publicGetMotorcycleById } from "@/app/data/public/public-get-motorcycle";
import { DelayAlert } from "@/components/home/DelayAlert";
import { ReloadButton } from "@/components/home/ReloadButton";
import {
  getArrivalStatus,
  getStatusColor,
  mapRegistrationStatusLabel,
} from "@/lib/bdc-data";
import { formatCPF } from "@/lib/cpf";
import {
  getContactPhone,
  getDelayMessage,
  getSetting,
  getWhatsAppMessage,
} from "@/lib/data/settings";
import { maskChassis } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Detalhes da Motocicleta",
};

export default async function MotocicletaDetalhePage({
  params,
}: {
  params: Promise<{ motorcycleId: string }>;
}) {
  const { motorcycleId } = await params;

  const motorcycle = await publicGetMotorcycleById(motorcycleId);

  if (!motorcycle || !motorcycle.client) {
    redirect("/tracking/unavailable");
  }

  const client = motorcycle.client;
  const logoUrl = await getSetting("logo_url");
  const contactPhone = await getContactPhone();
  const delayMessage = await getDelayMessage();
  const whatsappMessage = await getWhatsAppMessage();

  const arrivalStatus = getArrivalStatus(motorcycle.forecastArrival, motorcycle.forecastArrivalStatus);
  const statusLabel = mapRegistrationStatusLabel(motorcycle.registrationStatus);
  const statusColor = getStatusColor(statusLabel);

  return (
    <div className="flex min-h-full flex-col items-center bg-background px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <main className="flex w-full max-w-2xl flex-col gap-5">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Image src={logoUrl || "/logo-auge.png"} alt="" width={40} height={40} className="object-contain" aria-hidden="true" />
            <h1 className="truncate text-lg font-bold sm:text-xl">
              Acompanhamento de Motocicleta
            </h1>
          </div>
          <ReloadButton />
        </div>

        {/* Hero de status — primeira coisa que o cliente precisa ver */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold animate-blink-status ${arrivalStatus.color}`}
            >
              <span
                className="size-2 rounded-full bg-current"
                aria-hidden="true"
              />
              {arrivalStatus.label}
            </span>
            <p className="text-2xl font-bold leading-tight">
              {motorcycle.model}
            </p>
            <p className="font-mono text-sm text-muted-foreground tracking-wide">
              {maskChassis(motorcycle.chassi)}
            </p>
          </div>

          {motorcycle.forecastArrival && (
            <div className="mt-5">
              <DelayAlert
                forecastDate={motorcycle.forecastArrival}
                forecastArrivalStatus={motorcycle.forecastArrivalStatus}
                contactPhone={contactPhone}
                delayMessage={delayMessage}
                whatsappMessage={whatsappMessage}
                clientName={client.name}
                model={motorcycle.model}
                chassis={motorcycle.chassi}
              />
            </div>
          )}
        </div>

        {/* Dados do cliente */}
        <section
          aria-labelledby="dados-cliente"
          className="rounded-2xl border bg-card p-6 shadow-sm"
        >
          <h2 id="dados-cliente" className="text-base font-semibold">
            {client.name}
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            {client.cpf && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <dt className="sr-only">CPF</dt>
                <dd>CPF: {formatCPF(client.cpf)}</dd>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="size-3.5" aria-hidden="true" />
                <dt className="sr-only">Vendedor</dt>
                <dd>{client.sellersName}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden="true" />
                <dt className="sr-only">Cidade</dt>
                <dd>{client.city}</dd>
              </div>
            </div>
          </dl>
        </section>

        {/* Detalhes da moto */}
        <section
          aria-labelledby="detalhes-moto"
          className="rounded-2xl border bg-muted/20 p-5"
        >
          <h2 id="detalhes-moto" className="sr-only">
            Detalhes da motocicleta
          </h2>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            {client.billingDate && (
              <div>
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="size-3.5" aria-hidden="true" />
                  Data de Faturamento
                </dt>
                <dd className="mt-1 font-medium">
                  {new Date(client.billingDate).toLocaleDateString("pt-BR")}
                </dd>
              </div>
            )}

            <div>
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5" aria-hidden="true" />
                Previsão de Chegada
              </dt>
              <dd className="mt-1 font-medium">
                {motorcycle.forecastArrival
                  ? new Date(motorcycle.forecastArrival).toLocaleDateString(
                      "pt-BR",
                    )
                  : "—"}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Situação</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}

import { Bike } from "lucide-react";
import type { Metadata } from "next";
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
    redirect("/acompanhamento/indisponivel");
  }

  const client = motorcycle.client;
  const contactPhone = await getContactPhone();
  const delayMessage = await getDelayMessage();
  const whatsappMessage = await getWhatsAppMessage();

  const arrivalStatus = getArrivalStatus(motorcycle.forecastArrival);
  const statusLabel = mapRegistrationStatusLabel(motorcycle.registrationStatus);
  const statusColor = getStatusColor(statusLabel);

  return (
    <div className="flex min-h-full flex-col items-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Bike className="size-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Acompanhamento de Motocicleta</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ReloadButton />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{client.name}</h2>
          {client.cpf && (
            <p className="mt-1 text-sm text-muted-foreground">
              CPF: {formatCPF(client.cpf)}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Vendedor: {client.sellersName} | Cidade: {client.city}
          </p>

          <hr className="my-4" />

          {motorcycle.forecastArrival && (
            <DelayAlert
              forecastDate={motorcycle.forecastArrival}
              contactPhone={contactPhone}
              delayMessage={delayMessage}
              whatsappMessage={whatsappMessage}
              clientName={client.name}
              model={motorcycle.model}
              chassis={motorcycle.chassi}
            />
          )}

          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Modelo</span>
                <p className="font-medium">{motorcycle.model}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Chassi</span>
                <p className="font-mono tracking-wide">
                  {maskChassis(motorcycle.chassi)}
                </p>
              </div>
              {client.billingDate && (
                <div>
                  <span className="text-muted-foreground">
                    Data de Faturamento
                  </span>
                  <p className="font-medium">
                    {new Date(client.billingDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">
                  Previsão de Chegada
                </span>
                <p className="font-medium">
                  {motorcycle.forecastArrival
                    ? new Date(motorcycle.forecastArrival).toLocaleDateString(
                        "pt-BR",
                      )
                    : "—"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status Chegada</span>
                <p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${arrivalStatus.color}`}
                  >
                    {arrivalStatus.label}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Situação</span>
                <p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

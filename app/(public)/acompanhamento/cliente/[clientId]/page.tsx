import { Bike } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientById } from "@/lib/data/client";
import { getContactPhone, getDelayMessage, getWhatsAppMessage } from "@/lib/data/settings";
import {
  getArrivalStatus,
  getStatusColor,
  mapRegistrationStatusLabel,
} from "@/lib/bdc-data";
import { formatCPF } from "@/lib/cpf";
import { maskChassis } from "@/lib/utils";
import { LastUpdated } from "@/components/home/LastUpdated";
import { ReloadButton } from "@/components/home/ReloadButton";
import { DelayAlert } from "@/components/home/DelayAlert";

export const metadata: Metadata = {
  title: "Detalhes do Cliente",
};

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClientById(clientId);

  if (!client) {
    notFound();
  }

  const contactPhone = await getContactPhone();
  const delayMessage = await getDelayMessage();
  const whatsappMessage = await getWhatsAppMessage();

  return (
    <div className="flex min-h-full flex-col items-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Bike className="size-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">
              Acompanhamento de Motocicleta
            </h1>
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

          {client.motorcycles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma motocicleta vinculada no momento.
            </p>
          )}

          <div className="space-y-4">
            {client.motorcycles.map((moto) => {
              const arrivalStatus = getArrivalStatus(moto.forecastArrival);
              const statusLabel = mapRegistrationStatusLabel(
                moto.registrationStatus,
              );
              const statusColor = getStatusColor(statusLabel);

              return (
                <div key={moto.id} className="space-y-3">
                  {moto.forecastArrival && (
                    <DelayAlert
                      forecastDate={moto.forecastArrival}
                      contactPhone={contactPhone}
                      delayMessage={delayMessage}
                      whatsappMessage={whatsappMessage}
                      clientName={client.name}
                      model={moto.model}
                      chassis={moto.chassi}
                    />
                  )}

                  <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Modelo</span>
                      <p className="font-medium">{moto.model}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Chassi</span>
                      <p className="font-mono tracking-wide">
                        {maskChassis(moto.chassi)}
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
                        {moto.forecastArrival
                          ? new Date(moto.forecastArrival).toLocaleDateString(
                              "pt-BR",
                            )
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Status Chegada
                      </span>
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

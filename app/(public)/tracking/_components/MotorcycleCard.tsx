import { ArrowUpRight, Bike, CalendarDays } from "lucide-react";
import Link from "next/link";
import {
  getArrivalStatus,
  getStatusColor,
  mapRegistrationStatusLabel,
} from "@/lib/bdc-data";
import { formatDateBR, maskChassis } from "@/lib/utils";
import { CopyLinkButton } from "./CopyLinkButton";

type TrackingMotorcycle = {
  id: string;
  model: string;
  chassi: string;
  forecastArrival: Date | null;
  forecastArrivalStatus: string | null;
  arrivedAt?: Date | null;
  registrationStatus: string | null;
  registrationDate?: Date | null;
};

export function MotorcycleCard({
  motorcycle,
  showActions = true,
}: {
  motorcycle: TrackingMotorcycle;
  showActions?: boolean;
}) {
  const arrival = getArrivalStatus(
    motorcycle.forecastArrival,
    motorcycle.forecastArrivalStatus,
  );
  const registration = mapRegistrationStatusLabel(
    motorcycle.registrationStatus,
  );
  return (
    <article
      className="overflow-hidden rounded-2xl border border-base-300 bg-base-100"
      aria-label={`Motocicleta ${motorcycle.model}`}
    >
      <div className="space-y-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="rounded-xl bg-base-200 p-3 text-base-content/60">
              <Bike className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="break-words text-lg font-semibold sm:text-xl">
                {motorcycle.model}
              </h2>
              <p className="mt-1 text-xs text-base-content/55">Chassi</p>
              <p className="break-all font-mono text-sm text-base-content/70">
                {maskChassis(motorcycle.chassi)}
              </p>
            </div>
          </div>
          <span
            className={`badge h-auto border-0 px-3 py-1.5 text-xs font-medium ${arrival.color}`}
          >
            {arrival.label}
          </span>
        </div>
        <dl className="grid gap-5 border-t border-base-300 pt-5 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-2 text-xs text-base-content/60">
              <CalendarDays className="size-4" aria-hidden="true" />
              Previsão de chegada
            </dt>
            <dd className="mt-2 text-sm font-medium">
              {formatDateBR(motorcycle.forecastArrival) ??
                "Sem previsão informada"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-base-content/60">Emplacamento</dt>
            <dd className="mt-2">
              <span
                className={`badge h-auto border-0 px-2.5 py-1 text-xs ${getStatusColor(registration)}`}
              >
                {registration}
              </span>
            </dd>
          </div>
          {motorcycle.arrivedAt && (
            <div>
              <dt className="text-xs text-base-content/60">Recebida em</dt>
              <dd className="mt-2 text-sm font-medium">
                {new Date(motorcycle.arrivedAt).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </dd>
            </div>
          )}
          {motorcycle.registrationDate && (
            <div>
              <dt className="text-xs text-base-content/60">
                Data de emplacamento
              </dt>
              <dd className="mt-2 text-sm font-medium">
                {formatDateBR(motorcycle.registrationDate)}
              </dd>
            </div>
          )}
        </dl>
      </div>
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-300 px-5 py-3 sm:px-7">
          <Link
            href={`/tracking/motorcycle/${motorcycle.id}`}
            className="btn btn-ghost btn-sm min-h-10 gap-2 text-primary"
          >
            Ver detalhes
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          <CopyLinkButton url={`/tracking/motorcycle/${motorcycle.id}`} />
        </div>
      )}
    </article>
  );
}

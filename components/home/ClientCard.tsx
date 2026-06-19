import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getStatusColor,
  getArrivalStatus,
  mapRegistrationStatusLabel,
} from "@/lib/bdc-data";
import type { searchClients } from "@/lib/data/client";
import { maskChassis } from "@/lib/utils";
import { CopyLinkButton } from "./CopyLinkButton";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type ClientWithMotorcycles = Awaited<
  ReturnType<typeof searchClients>
>[number];

interface ClientCardProps {
  client: ClientWithMotorcycles;
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{client.name}</CardTitle>
        <CardDescription>Vendedor: {client.sellersName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {client.motorcycles.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma motocicleta associada.
          </p>
        )}
        {client.motorcycles.map((motorcycle) => {
          const arrivalStatus = getArrivalStatus(motorcycle.forecastArrival);
          const statusLabel = mapRegistrationStatusLabel(
            motorcycle.registrationStatus,
          );
          const statusColor = getStatusColor(statusLabel);

          return (
            <div
              key={motorcycle.id}
              className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Modelo</span>
                <span className="text-sm font-medium">{motorcycle.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Chassi</span>
                <span className="font-mono text-sm tracking-wide">
                  {maskChassis(motorcycle.chassi)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Previsão de Chegada
                </span>
                <span className="text-sm font-medium">
                  {motorcycle.forecastArrival
                    ? new Date(motorcycle.forecastArrival).toLocaleDateString("pt-BR")
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Status Chegada
                </span>
                <Badge className={arrivalStatus.color}>
                  {arrivalStatus.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Emplacamento
                </span>
                <Badge className={statusColor}>{statusLabel}</Badge>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border/40 mt-1">
                <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs h-7 px-2">
                  <Link href={`/acompanhamento/motocicleta/${motorcycle.id}`}>
                    <ExternalLink className="size-3.5" />
                    Abrir
                  </Link>
                </Button>
                <CopyLinkButton url={`/acompanhamento/motocicleta/${motorcycle.id}`} />
              </div>
            </div>
          );
        })}
      </CardContent>

    </Card>
  );
}

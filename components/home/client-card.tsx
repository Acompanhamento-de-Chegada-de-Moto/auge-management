import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getStatusChegada,
  getSituacaoColor,
  mapRegistrationStatusLabel,
} from "@/lib/bdc-data";
import { maskChassis } from "@/lib/utils";
import type { searchClientsByName } from "@/lib/data/client";

type ClientWithMotorcycles = Awaited<
  ReturnType<typeof searchClientsByName>
>[number];

interface ClientCardProps {
  client: ClientWithMotorcycles;
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{client.name}</CardTitle>
        <CardDescription>Vendedor: {client.sellerName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {client.motorcycles.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma motocicleta associada.
          </p>
        )}
        {client.motorcycles.map((moto) => {
          const statusChegada = getStatusChegada(moto.arrivalDate);
          const statusLabel = mapRegistrationStatusLabel(
            moto.registrationStatus,
          );
          const situacaoColor = getSituacaoColor(statusLabel);

          return (
            <div
              key={moto.id}
              className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Modelo</span>
                <span className="text-sm font-medium">{moto.model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Chassi</span>
                <span className="font-mono text-sm tracking-wide">
                  {maskChassis(moto.chassis)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Status Chegada
                </span>
                <Badge className={statusChegada.color}>
                  {statusChegada.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Emplacamento
                </span>
                <Badge className={situacaoColor}>{statusLabel}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

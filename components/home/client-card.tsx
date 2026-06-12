import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { CopyLinkButton } from "./copy-link-button";
import Link from "next/link";
import { Share2 } from "lucide-react";
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
        <CardDescription>Vendedor: {client.sellerName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {client.motorcycles.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma motocicleta associada.
          </p>
        )}
        {client.motorcycles.map((motorcycle) => {
          const arrivalStatus = getArrivalStatus(motorcycle.forecastDate);
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
                  {maskChassis(motorcycle.chassis)}
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
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="flex gap-2 border-t pt-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/consultar/cliente/${client.id}`}>
            <Share2 className="mr-1.5 size-3.5" />
            Compartilhar
          </Link>
        </Button>
        <CopyLinkButton url={`/consultar/cliente/${client.id}`} />
      </CardFooter>
    </Card>
  );
}
